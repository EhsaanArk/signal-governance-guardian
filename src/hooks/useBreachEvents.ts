
import { useState } from 'react';
import { toast } from 'sonner';
import { subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { Market } from '@/types/database';
import { BreachEventFilters } from '@/types/breach';
import { BreachEventsService } from '@/lib/api/breach-events-service';
import { BreachFilters } from '@/utils/breach-filters';
import { BreachTransformer } from '@/utils/breach-transformer';
import { endCooldown } from '@/lib/api/breach-events';

export const useBreachEvents = () => {
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const [providerSearch, setProviderSearch] = useState('');
  const [selectedRuleSet, setSelectedRuleSet] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90),
    to: new Date()
  });

  const breachService = new BreachEventsService();

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
        // Step 1: Fetch all breach events
        const allBreaches = await breachService.fetchAllBreachEvents();
        
        if (allBreaches.length === 0) {
          console.log('No breach events exist in the database at all');
          return [];
        }

        // Step 2: Apply filters
        let filteredBreaches = BreachFilters.applyDateRangeFilter(allBreaches, dateRange);
        filteredBreaches = BreachFilters.applyMarketFilter(filteredBreaches, selectedMarket);
        filteredBreaches = BreachFilters.applyRuleSetFilter(filteredBreaches, selectedRuleSet);

        console.log('Filtered breach events:', filteredBreaches);

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
