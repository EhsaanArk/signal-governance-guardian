
import { useState } from 'react';
import { toast } from 'sonner';
import { subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { Market } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { endCooldown } from '@/lib/api/breach-events';

export const useBreachEvents = () => {
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const [providerSearch, setProviderSearch] = useState('');
  const [selectedRuleSet, setSelectedRuleSet] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90), // Extended to 90 days to catch all data
    to: new Date()
  });

  // Fetch breach events with simplified approach and comprehensive debugging
  const { data: breaches = [], isLoading, refetch } = useQuery({
    queryKey: ['breachEvents', selectedMarket, providerSearch, selectedRuleSet, dateRange],
    queryFn: async () => {
      console.log('=== FETCHING BREACH EVENTS - SIMPLIFIED APPROACH ===');
      console.log('Applied filters:', {
        selectedMarket,
        providerSearch,
        selectedRuleSet,
        dateRange: {
          from: dateRange?.from?.toISOString(),
          to: dateRange?.to?.toISOString()
        }
      });

      try {
        // Step 1: Start with the most basic query to see ALL breach events
        console.log('Step 1: Fetching ALL breach events first...');
        const { data: allBreaches, error: allBreachesError } = await supabase
          .from('breach_events')
          .select('*')
          .order('occurred_at', { ascending: false });

        if (allBreachesError) {
          console.error('Error fetching all breach events:', allBreachesError);
          throw allBreachesError;
        }

        console.log('All breach events in database:', allBreaches);
        console.log('Total breach events found:', allBreaches?.length || 0);

        if (!allBreaches || allBreaches.length === 0) {
          console.log('No breach events exist in the database at all');
          return [];
        }

        // Step 2: Apply filters one by one and see what happens
        let filteredBreaches = [...allBreaches];

        // Apply date range filter
        if (dateRange?.from || dateRange?.to) {
          const beforeDateFilter = filteredBreaches.length;
          filteredBreaches = filteredBreaches.filter(breach => {
            const breachDate = new Date(breach.occurred_at);
            const fromMatch = !dateRange?.from || breachDate >= dateRange.from;
            const toMatch = !dateRange?.to || breachDate <= new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000); // Add 1 day to include end date
            return fromMatch && toMatch;
          });
          console.log(`Date filter: ${beforeDateFilter} -> ${filteredBreaches.length} events`);
        }

        // Apply market filter
        if (selectedMarket !== 'All') {
          const beforeMarketFilter = filteredBreaches.length;
          filteredBreaches = filteredBreaches.filter(breach => breach.market === selectedMarket);
          console.log(`Market filter (${selectedMarket}): ${beforeMarketFilter} -> ${filteredBreaches.length} events`);
        }

        // Apply rule set filter
        if (selectedRuleSet !== 'all') {
          const beforeRuleSetFilter = filteredBreaches.length;
          filteredBreaches = filteredBreaches.filter(breach => breach.rule_set_id === selectedRuleSet);
          console.log(`Rule set filter (${selectedRuleSet}): ${beforeRuleSetFilter} -> ${filteredBreaches.length} events`);
        }

        console.log('Filtered breach events:', filteredBreaches);

        if (filteredBreaches.length === 0) {
          console.log('No breach events match the current filters');
          return [];
        }

        // Step 3: Fetch related data for the filtered events
        const providerIds = [...new Set(filteredBreaches.map(b => b.provider_id))];
        const ruleSetIds = [...new Set(filteredBreaches.map(b => b.rule_set_id))];
        const subRuleIds = [...new Set(filteredBreaches.map(b => b.sub_rule_id))];

        console.log('Fetching related data:', { 
          providerIds: providerIds.length, 
          ruleSetIds: ruleSetIds.length, 
          subRuleIds: subRuleIds.length 
        });

        // Fetch related data in parallel
        const [
          { data: providers, error: providersError },
          { data: ruleSetsData, error: ruleSetsError },
          { data: subRules, error: subRulesError }
        ] = await Promise.all([
          supabase
            .from('signal_providers')
            .select('id, provider_name')
            .in('id', providerIds),
          supabase
            .from('rule_sets')
            .select('id, name')
            .in('id', ruleSetIds),
          supabase
            .from('sub_rules')
            .select('id, rule_type')
            .in('id', subRuleIds)
        ]);

        if (providersError) console.error('Error fetching providers:', providersError);
        if (ruleSetsError) console.error('Error fetching rule sets:', ruleSetsError);
        if (subRulesError) console.error('Error fetching sub rules:', subRulesError);

        console.log('Related data fetched:', { 
          providers: providers?.length || 0, 
          ruleSets: ruleSetsData?.length || 0, 
          subRules: subRules?.length || 0 
        });

        // Create lookup maps
        const providerMap = new Map(providers?.map(p => [p.id, p.provider_name]) || []);
        const ruleSetMap = new Map(ruleSetsData?.map(rs => [rs.id, rs.name]) || []);
        const subRuleMap = new Map(subRules?.map(sr => [sr.id, sr.rule_type]) || []);

        // Step 4: Transform data
        let transformedData = filteredBreaches.map(breach => {
          const providerName = providerMap.get(breach.provider_id) || 'Unknown Provider';
          const ruleSetName = ruleSetMap.get(breach.rule_set_id) || 'Unknown Rule Set';
          const subRuleName = subRuleMap.get(breach.sub_rule_id) || 'Unknown Sub Rule';
          
          // Map action_taken to display action
          let displayAction = 'Unknown';
          switch (breach.action_taken) {
            case 'signal_rejected':
              displayAction = 'Rejected';
              break;
            case 'cooldown_triggered':
              displayAction = 'Cooldown';
              break;
            case 'suspension_applied':
              displayAction = 'Suspended';
              break;
            default:
              displayAction = 'Limited';
              break;
          }

          return {
            id: breach.id,
            timestamp: breach.occurred_at,
            provider: providerName,
            market: breach.market,
            ruleSetId: breach.rule_set_id,
            ruleSetName: ruleSetName,
            subRule: subRuleName,
            action: displayAction,
            details: typeof breach.details === 'object' 
              ? JSON.stringify(breach.details) 
              : String(breach.details || 'No details available')
          };
        });

        // Step 5: Apply provider search filter after transformation
        if (providerSearch.trim()) {
          const beforeProviderSearch = transformedData.length;
          const searchTerm = providerSearch.toLowerCase();
          transformedData = transformedData.filter(breach =>
            breach.provider.toLowerCase().includes(searchTerm)
          );
          console.log(`Provider search filter "${providerSearch}": ${beforeProviderSearch} -> ${transformedData.length} results`);
        }

        console.log('Final transformed breach events:', transformedData);
        return transformedData;

      } catch (error) {
        console.error('Error in breach events query:', error);
        toast.error('Failed to fetch breach events');
        return [];
      }
    }
  });

  const handleEndCoolDown = async (id: string) => {
    try {
      const { error } = await endCooldown(id, 'Manually ended by admin');
      if (error) {
        toast.error('Failed to end cooldown');
        console.error('Error ending cooldown:', error);
      } else {
        toast.success('Cool-down ended successfully');
        refetch();
      }
    } catch (error) {
      toast.error('Failed to end cooldown');
      console.error('Error ending cooldown:', error);
    }
  };

  return {
    selectedMarket,
    setSelectedMarket,
    providerSearch,
    setProviderSearch,
    selectedRuleSet,
    setSelectedRuleSet,
    dateRange,
    setDateRange,
    breaches,
    isLoading,
    handleEndCoolDown
  };
};
