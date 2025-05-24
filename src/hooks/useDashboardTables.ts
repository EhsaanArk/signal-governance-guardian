
import { useQuery } from '@tanstack/react-query';
import { fetchRecentBreaches } from '@/lib/api/breach-events';
import { fetchExpiringCooldowns } from '@/lib/api/cooldowns';
import { useDashboardContext } from './useDashboardContext';
import { queryKeys, defaultQueryOptions } from '@/lib/utils/queryKeys';
import { DashboardDataTransformers } from '@/lib/transformers/DashboardDataTransformers';
import { RecentBreach, ExpiringCooldown } from '@/lib/api/types';

export const useDashboardTables = () => {
  const { filters, getApiDateParams } = useDashboardContext();
  const { startDate, endDate, providerId } = getApiDateParams();

  console.log('📋 Dashboard Tables - Filter state:', filters);
  console.log('📋 Dashboard Tables - API params:', { startDate, endDate, providerId });

  // Fetch raw recent breaches data
  const { data: rawBreaches, isLoading: breachesLoading, error: breachesError } = useQuery<RecentBreach[]>({
    queryKey: queryKeys.dashboard.recentBreaches(startDate, endDate, providerId, filters.timeRange.preset),
    queryFn: () => {
      console.log('📋 Fetching recent breaches with params:', { startDate, endDate, providerId });
      return fetchRecentBreaches(10);
    },
    ...defaultQueryOptions,
  });

  // Fetch raw expiring cooldowns data
  const { data: rawCooldowns, isLoading: cooldownsLoading, error: cooldownsError } = useQuery<ExpiringCooldown[]>({
    queryKey: queryKeys.dashboard.expiringCooldowns(providerId),
    queryFn: () => {
      console.log('⏰ Fetching expiring cooldowns with provider:', providerId);
      return fetchExpiringCooldowns(10);
    },
    ...defaultQueryOptions,
  });

  // Transform data for UI consumption
  const transformedBreaches = rawBreaches 
    ? DashboardDataTransformers.transformBreachData(rawBreaches)
    : undefined;
    
  const transformedCooldowns = rawCooldowns 
    ? DashboardDataTransformers.transformCooldownData(rawCooldowns)
    : undefined;

  return {
    // Raw data
    rawBreaches,
    rawCooldowns,
    
    // Transformed data
    transformedBreaches,
    transformedCooldowns,
    
    // Loading states
    breachesLoading,
    cooldownsLoading,
    isLoading: breachesLoading || cooldownsLoading,
    
    // Error states
    breachesError,
    cooldownsError,
    hasError: !!breachesError || !!cooldownsError,
  };
};
