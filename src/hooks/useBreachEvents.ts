
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
    from: subDays(new Date(), 30), // Increased to 30 days to catch our dummy data
    to: new Date()
  });

  // Fetch breach events with proper error handling and debugging
  const { data: breaches = [], isLoading, refetch } = useQuery({
    queryKey: ['breachEvents', selectedMarket, providerSearch, selectedRuleSet, dateRange],
    queryFn: async () => {
      console.log('=== FETCHING BREACH EVENTS ===');
      console.log('Filters applied:', {
        selectedMarket,
        providerSearch,
        selectedRuleSet,
        dateRange: {
          from: dateRange?.from?.toISOString(),
          to: dateRange?.to?.toISOString()
        }
      });

      try {
        // Start with basic breach events query
        let query = supabase
          .from('breach_events')
          .select('*')
          .order('occurred_at', { ascending: false });

        // Apply market filter
        if (selectedMarket !== 'All') {
          console.log('Applying market filter:', selectedMarket);
          query = query.eq('market', selectedMarket);
        }

        // Apply rule set filter
        if (selectedRuleSet !== 'all') {
          console.log('Applying rule set filter:', selectedRuleSet);
          query = query.eq('rule_set_id', selectedRuleSet);
        }

        // Apply date range filter
        if (dateRange?.from) {
          console.log('Applying date from filter:', dateRange.from.toISOString());
          query = query.gte('occurred_at', dateRange.from.toISOString());
        }
        if (dateRange?.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          console.log('Applying date to filter:', endDate.toISOString());
          query = query.lte('occurred_at', endDate.toISOString());
        }

        console.log('Executing breach events query...');
        const { data: breachData, error: breachError } = await query;

        if (breachError) {
          console.error('Breach events query error:', breachError);
          throw breachError;
        }

        console.log('Raw breach events data:', breachData);

        if (!breachData || breachData.length === 0) {
          console.log('No breach events found with current filters');
          return [];
        }

        // Get unique IDs for related data
        const providerIds = [...new Set(breachData.map(b => b.provider_id))];
        const ruleSetIds = [...new Set(breachData.map(b => b.rule_set_id))];
        const subRuleIds = [...new Set(breachData.map(b => b.sub_rule_id))];

        console.log('Fetching related data for breach events:', { 
          providerIds: providerIds.length, 
          ruleSetIds: ruleSetIds.length, 
          subRuleIds: subRuleIds.length 
        });

        // Fetch related data in parallel
        const [
          { data: providers },
          { data: ruleSetsData },
          { data: subRules }
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

        console.log('Related data fetched:', { 
          providers: providers?.length || 0, 
          ruleSets: ruleSetsData?.length || 0, 
          subRules: subRules?.length || 0 
        });

        // Create lookup maps
        const providerMap = new Map(providers?.map(p => [p.id, p.provider_name]) || []);
        const ruleSetMap = new Map(ruleSetsData?.map(rs => [rs.id, rs.name]) || []);
        const subRuleMap = new Map(subRules?.map(sr => [sr.id, sr.rule_type]) || []);

        // Transform data with proper error handling
        let transformedData = breachData.map(breach => {
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

        console.log('Transformed breach data before provider filter:', transformedData);

        // Apply provider search filter after transformation
        if (providerSearch.trim()) {
          const searchTerm = providerSearch.toLowerCase();
          transformedData = transformedData.filter(breach =>
            breach.provider.toLowerCase().includes(searchTerm)
          );
          console.log(`Filtered by provider search "${providerSearch}":`, transformedData.length, 'results');
        }

        console.log('Final breach events data:', transformedData);
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
