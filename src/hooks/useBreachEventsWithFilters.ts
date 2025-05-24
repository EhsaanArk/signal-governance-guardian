
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BreachFiltersState } from './useBreachFilters';
import { BreachEventsService } from '@/lib/api/breach-events-service';
import { BreachFilters } from '@/utils/breach-filters';
import { BreachTransformer } from '@/utils/breach-transformer';
import { endCooldown } from '@/lib/api/breach-events';

export const useBreachEventsWithFilters = (filters: BreachFiltersState) => {
  const breachService = new BreachEventsService();

  const { data: breaches = [], isLoading, error, refetch } = useQuery({
    queryKey: ['breachEvents', filters],
    queryFn: async () => {
      console.log('🎯 ==> BREACH EVENTS QUERY STARTED <==');
      console.log('🔧 Applied filters:', {
        timeRangePreset: filters.timeRangePreset,
        dateRange: {
          from: filters.dateRange?.from?.toISOString(),
          to: filters.dateRange?.to?.toISOString()
        },
        market: filters.market,
        providerId: filters.providerId,
        ruleSetId: filters.ruleSetId,
        providerSearch: filters.providerSearch
      });

      try {
        // Step 1: Fetch all breach events
        console.log('📡 Step 1: Fetching breach events...');
        const allBreaches = await breachService.fetchAllBreachEvents();
        
        if (allBreaches.length === 0) {
          console.log('📭 No breach events exist in the database');
          return [];
        }

        console.log(`📊 Found ${allBreaches.length} total breach events in database`);

        // Step 2: Apply filters
        console.log('🔍 Step 2: Applying filters...');
        let filteredBreaches = BreachFilters.applyDateRangeFilter(allBreaches, filters.dateRange);
        console.log(`📅 After date filtering: ${filteredBreaches.length} breach events`);
        
        filteredBreaches = BreachFilters.applyMarketFilter(filteredBreaches, filters.market);
        console.log(`🏪 After market filtering: ${filteredBreaches.length} breach events`);
        
        filteredBreaches = BreachFilters.applyRuleSetFilter(filteredBreaches, filters.ruleSetId);
        console.log(`📋 After rule set filtering: ${filteredBreaches.length} breach events`);

        // Apply provider ID filter if selected
        if (filters.providerId) {
          const beforeProviderFilter = filteredBreaches.length;
          filteredBreaches = filteredBreaches.filter(breach => breach.provider_id === filters.providerId);
          console.log(`👤 After provider ID filtering: ${beforeProviderFilter} -> ${filteredBreaches.length} breach events`);
        }

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

        // Step 5: Apply provider search filter (text search)
        console.log('🔍 Step 5: Applying provider search...');
        transformedData = BreachFilters.applyProviderSearchFilter(transformedData, filters.providerSearch);

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
    breaches,
    isLoading,
    error,
    handleEndCoolDown
  };
};
