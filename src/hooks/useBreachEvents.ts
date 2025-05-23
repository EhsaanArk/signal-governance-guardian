
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2020, 0, 1), // Wide default range from 2020
    to: new Date(2030, 11, 31)  // to 2030 to catch all data including future dates
  });

  const breachService = new BreachEventsService();

  const { data: breaches = [], isLoading, refetch } = useQuery({
    queryKey: ['breachEvents', selectedMarket, providerSearch, selectedRuleSet, dateRange],
    queryFn: async () => {
      console.log('=== FETCHING BREACH EVENTS - ENHANCED DATE FILTERING ===');
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
        // Step 1: Fetch all breach events
        const allBreaches = await breachService.fetchAllBreachEvents();
        
        if (allBreaches.length === 0) {
          console.log('No breach events exist in the database at all');
          return [];
        }

        console.log(`Found ${allBreaches.length} total breach events in database`);
        console.log('Sample dates from breach events:', allBreaches.slice(0, 3).map(b => b.occurred_at));

        // Step 2: Apply filters
        let filteredBreaches = BreachFilters.applyDateRangeFilter(allBreaches, dateRange);
        filteredBreaches = BreachFilters.applyMarketFilter(filteredBreaches, selectedMarket);
        filteredBreaches = BreachFilters.applyRuleSetFilter(filteredBreaches, selectedRuleSet);

        console.log(`After filtering: ${filteredBreaches.length} breach events`);

        if (filteredBreaches.length === 0) {
          console.log('No breach events match the current filters');
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
