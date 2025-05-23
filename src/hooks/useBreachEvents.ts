
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
    from: subDays(new Date(), 7),
    to: new Date()
  });

  // Fetch breach events with simplified query using explicit JOINs
  const { data: breaches = [], isLoading, refetch } = useQuery({
    queryKey: ['breachEvents', selectedMarket, providerSearch, selectedRuleSet, dateRange],
    queryFn: async () => {
      console.log('Fetching breach events with filters:', {
        selectedMarket,
        providerSearch,
        selectedRuleSet,
        dateRange
      });

      try {
        // Build the query with explicit JOINs
        let query = supabase
          .from('breach_events')
          .select(`
            id,
            occurred_at,
            market,
            action_taken,
            details,
            signal_data,
            rule_set_id,
            sub_rule_id,
            provider_id
          `)
          .order('occurred_at', { ascending: false });

        // Apply market filter
        if (selectedMarket !== 'All') {
          query = query.eq('market', selectedMarket);
        }

        // Apply rule set filter
        if (selectedRuleSet !== 'all') {
          query = query.eq('rule_set_id', selectedRuleSet);
        }

        // Apply date range filter
        if (dateRange?.from) {
          query = query.gte('occurred_at', dateRange.from.toISOString());
        }
        if (dateRange?.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          query = query.lte('occurred_at', endDate.toISOString());
        }

        const { data: breachData, error: breachError } = await query;

        if (breachError) {
          console.error('Error fetching breach events:', breachError);
          throw breachError;
        }

        console.log('Raw breach data:', breachData);

        if (!breachData || breachData.length === 0) {
          console.log('No breach events found');
          return [];
        }

        // Fetch related data separately to avoid JOIN issues
        const providerIds = [...new Set(breachData.map(b => b.provider_id))];
        const ruleSetIds = [...new Set(breachData.map(b => b.rule_set_id))];
        const subRuleIds = [...new Set(breachData.map(b => b.sub_rule_id))];

        console.log('Fetching related data for:', { providerIds, ruleSetIds, subRuleIds });

        // Fetch providers
        const { data: providers } = await supabase
          .from('signal_providers')
          .select('id, provider_name')
          .in('id', providerIds);

        // Fetch rule sets
        const { data: ruleSetsData } = await supabase
          .from('rule_sets')
          .select('id, name')
          .in('id', ruleSetIds);

        // Fetch sub rules
        const { data: subRules } = await supabase
          .from('sub_rules')
          .select('id, rule_type')
          .in('id', subRuleIds);

        console.log('Related data fetched:', { providers, ruleSetsData, subRules });

        // Create lookup maps
        const providerMap = new Map(providers?.map(p => [p.id, p.provider_name]) || []);
        const ruleSetMap = new Map(ruleSetsData?.map(rs => [rs.id, rs.name]) || []);
        const subRuleMap = new Map(subRules?.map(sr => [sr.id, sr.rule_type]) || []);

        // Transform data
        let transformedData = breachData.map(breach => ({
          id: breach.id,
          timestamp: breach.occurred_at,
          provider: providerMap.get(breach.provider_id) || 'Unknown',
          market: breach.market,
          ruleSetId: breach.rule_set_id,
          ruleSetName: ruleSetMap.get(breach.rule_set_id) || 'Unknown',
          subRule: subRuleMap.get(breach.sub_rule_id) || 'Unknown',
          action: breach.action_taken === 'signal_rejected' ? 'Rejected' : 
                  breach.action_taken === 'cooldown_triggered' ? 'Cooldown' : 
                  breach.action_taken === 'suspension_applied' ? 'Suspended' : 'Limited',
          details: typeof breach.details === 'object' ? JSON.stringify(breach.details) : String(breach.details || '')
        }));

        console.log('Transformed data before provider filter:', transformedData);

        // Apply provider search filter
        if (providerSearch.trim()) {
          transformedData = transformedData.filter(breach =>
            breach.provider.toLowerCase().includes(providerSearch.toLowerCase())
          );
        }

        console.log('Final transformed data:', transformedData);
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
