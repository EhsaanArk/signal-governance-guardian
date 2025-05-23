
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

  const { data: breaches = [], isLoading, error, refetch } = useQuery({
    queryKey: ['breachEvents', selectedMarket, providerSearch, selectedRuleSet, dateRange],
    queryFn: async () => {
      console.log('🎯 ==> BREACH EVENTS QUERY STARTED <==');
      console.log('🔧 Applied filters:', {
        selectedMarket,
        providerSearch,
        selectedRuleSet,
        dateRange: {
          from: dateRange?.from?.toISOString(),
          to: dateRange?.to?.toISOString()
        }
      });

      try {
        // Step 1: Fetch all breach events with connection test
        console.log('📡 Step 1: Fetching breach events...');
        const allBreaches = await breachService.fetchAllBreachEvents();
        
        if (allBreaches.length === 0) {
          console.log('📭 No breach events exist in the database');
          return [];
        }

        console.log(`📊 Found ${allBreaches.length} total breach events in database`);

        // Step 2: Apply filters with enhanced debugging
        console.log('🔍 Step 2: Applying filters...');
        let filteredBreaches = BreachFilters.applyDateRangeFilter(allBreaches, dateRange);
        console.log(`📅 After date filtering: ${filteredBreaches.length} breach events`);
        
        filteredBreaches = BreachFilters.applyMarketFilter(filteredBreaches, selectedMarket);
        console.log(`🏪 After market filtering: ${filteredBreaches.length} breach events`);
        
        filteredBreaches = BreachFilters.applyRuleSetFilter(filteredBreaches, selectedRuleSet);
        console.log(`📋 After rule set filtering: ${filteredBreaches.length} breach events`);

        if (filteredBreaches.length === 0) {
          console.log('❌ No breach events match the current filters');
          return [];
        }

        // Step 3: Fetch related data
        console.log('🔗 Step 3: Fetching related data...');
        const relatedData = await breachService.fetchRelatedData(filteredBreaches);
        const { providerMap, ruleSetMap, subRuleMap } = BreachTransformer.createLookupMaps(
          relatedData.providers,
          relatedData.ruleSets,
          relatedData.subRules
        );

        // Step 4: Transform data
        console.log('🔄 Step 4: Transforming data...');
        let transformedData = BreachTransformer.transformBreachEvents(
          filteredBreaches,
          providerMap,
          ruleSetMap,
          subRuleMap
        );

        // Step 5: Apply provider search filter
        console.log('🔍 Step 5: Applying provider search...');
        transformedData = BreachFilters.applyProviderSearchFilter(transformedData, providerSearch);

        console.log('✅ Final transformed breach events:', transformedData.length);
        console.log('🎯 ==> BREACH EVENTS QUERY COMPLETED <==');
        return transformedData;

      } catch (error) {
        console.error('💥 ==> BREACH EVENTS QUERY FAILED <==');
        console.error('Error details:', error);
        toast.error(`Failed to fetch breach events: ${error.message || 'Unknown error'}`);
        return [];
      }
    },
    retry: (failureCount, error) => {
      // Only retry once for network errors, not for RLS or permissions errors
      console.log(`🔄 Query retry attempt ${failureCount}`, error);
      return failureCount < 1;
    },
    retryDelay: 1000
  });

  // Log any query errors
  if (error) {
    console.error('🚨 Breach events query error:', error);
  }

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
    error,
    handleEndCoolDown
  };
};
