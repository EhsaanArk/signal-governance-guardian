
import { useState } from 'react';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { Market } from '@/types/database';
import { BreachEventsService } from '@/lib/api/breach-events-service';
import { BreachFilters } from '@/utils/breach-filters';
import { BreachTransformer } from '@/utils/breach-transformer';
import { endCooldown } from '@/lib/api/breach-events';

export const useBreachEvents = () => {
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const [providerSearch, setProviderSearch] = useState('');
  const [selectedRuleSet, setSelectedRuleSet] = useState('all');
  
  // Create normalized default date range that includes existing breach events (May 2025)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2020, 0, 1, 12, 0, 0, 0), // Jan 1, 2020 at noon
    to: new Date(2030, 11, 31, 12, 0, 0, 0)  // Dec 31, 2030 at noon
  });

  const breachService = new BreachEventsService();

  const { data: breaches = [], isLoading, refetch } = useQuery({
    queryKey: ['breachEvents', selectedMarket, providerSearch, selectedRuleSet, dateRange],
    queryFn: async () => {
      console.log('=== FETCHING BREACH EVENTS - TIMEZONE FIXED FILTERING ===');
      console.log('Applied filters:', {
        selectedMarket,
        providerSearch,
        selectedRuleSet,
        dateRange: {
          from: dateRange?.from?.toISOString(),
          to: dateRange?.to?.toISOString(),
          fromLocal: dateRange?.from?.toString(),
          toLocal: dateRange?.to?.toString()
        }
      });

      try {
        // Step 1: Fetch all breach events
        const allBreaches = await breachService.fetchAllBreachEvents();
        
        if (allBreaches.length === 0) {
          console.log('No breach events exist in the database at all');
          return [];
        }

        console.log(`Found ${allBreaches.length} total breach events in database`);
        console.log('Sample breach dates from database:', allBreaches.slice(0, 5).map(b => ({
          id: b.id,
          occurred_at: b.occurred_at,
          asDate: new Date(b.occurred_at).toISOString()
        })));

        // Step 2: Apply filters with enhanced debugging
        let filteredBreaches = BreachFilters.applyDateRangeFilter(allBreaches, dateRange);
        console.log(`After date filtering: ${filteredBreaches.length} breach events`);
        
        filteredBreaches = BreachFilters.applyMarketFilter(filteredBreaches, selectedMarket);
        console.log(`After market filtering: ${filteredBreaches.length} breach events`);
        
        filteredBreaches = BreachFilters.applyRuleSetFilter(filteredBreaches, selectedRuleSet);
        console.log(`After rule set filtering: ${filteredBreaches.length} breach events`);

        if (filteredBreaches.length === 0) {
          console.log('No breach events match the current filters');
          console.log('This could be due to:');
          console.log('1. Date range not covering the breach dates');
          console.log('2. Market filter excluding the breach markets');
          console.log('3. Rule set filter excluding the breach rule sets');
          return [];
        }

        // Step 3: Fetch related data
        const relatedData = await breachService.fetchRelatedData(filteredBreaches);
        const { providerMap, ruleSetMap, subRuleMap } = BreachTransformer.createLookupMaps(
          relatedData.providers,
          relatedData.ruleSets,
          relatedData.subRules
        );

        // Step 4: Transform data
        let transformedData = BreachTransformer.transformBreachEvents(
          filteredBreaches,
          providerMap,
          ruleSetMap,
          subRuleMap
        );

        // Step 5: Apply provider search filter
        transformedData = BreachFilters.applyProviderSearchFilter(transformedData, providerSearch);

        console.log('Final transformed breach events:', transformedData.length);
        console.log('Final breach events sample:', transformedData.slice(0, 2));
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
