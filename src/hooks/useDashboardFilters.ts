
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/utils/queryKeys';
import { 
  DashboardFiltersState, 
  TimeRangeState, 
  ProviderState,
  TimeRangePreset,
  TIME_RANGE_PRESETS
} from '@/types/dashboardFilters';
import { getDateRangeFromPreset } from '@/lib/utils/timeRangeUtils';
import { useTimeRangeFilters } from './useTimeRangeFilters';
import { useProviderFilters } from './useProviderFilters';

export const useDashboardFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<DashboardFiltersState>(() => {
    const rangeParam = searchParams.get('range');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const providerParam = searchParams.get('provider');
    const providerNameParam = searchParams.get('providerName');
    
    console.log('🔍 Initializing dashboard filters from URL:', {
      rangeParam,
      fromParam,
      toParam,
      providerParam,
      providerNameParam
    });
    
    let timeRange: TimeRangeState;
    if (fromParam && toParam) {
      timeRange = {
        preset: 'custom',
        from: new Date(fromParam),
        to: new Date(toParam)
      };
    } else if (rangeParam && rangeParam in TIME_RANGE_PRESETS) {
      const preset = rangeParam as TimeRangePreset;
      const { from, to } = getDateRangeFromPreset(preset);
      timeRange = { preset, from, to };
      console.log(`📅 Setting time range to ${preset}:`, { from: from.toISOString(), to: to.toISOString() });
    } else {
      const { from, to } = getDateRangeFromPreset('24h');
      timeRange = { preset: '24h', from, to };
      console.log('📅 Defaulting to 24h time range:', { from: from.toISOString(), to: to.toISOString() });
    }

    const provider: ProviderState = {
      providerId: providerParam || null,
      providerName: providerNameParam ? decodeURIComponent(providerNameParam.replace(/\+/g, ' ')) : null
    };

    return { timeRange, provider };
  });

  // Immediate query invalidation function
  const forceRefreshQueries = useCallback(async () => {
    console.log('🔄 Starting immediate query refresh');
    
    // Step 1: Remove all cached dashboard data
    await queryClient.cancelQueries({ queryKey: queryKeys.dashboard.all });
    queryClient.removeQueries({ queryKey: queryKeys.dashboard.all });
    
    // Step 2: Invalidate and force immediate refetch
    await queryClient.invalidateQueries({ 
      queryKey: queryKeys.dashboard.all,
      refetchType: 'active'
    });
    
    console.log('✅ Query refresh completed');
  }, [queryClient]);

  const updateFilters = useCallback(async (newFilters: Partial<DashboardFiltersState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    console.log('🔄 Updating filters synchronously:', updatedFilters);
    
    // Update state first
    setFilters(updatedFilters);
    
    // Update URL parameters synchronously
    const newSearchParams = new URLSearchParams();
    
    // Handle time range params
    if (updatedFilters.timeRange.preset === 'custom') {
      newSearchParams.set('from', updatedFilters.timeRange.from.toISOString().split('T')[0]);
      newSearchParams.set('to', updatedFilters.timeRange.to.toISOString().split('T')[0]);
    } else {
      newSearchParams.set('range', updatedFilters.timeRange.preset);
    }
    
    // Handle provider params with proper encoding
    if (updatedFilters.provider.providerId && updatedFilters.provider.providerName) {
      newSearchParams.set('provider', updatedFilters.provider.providerId);
      newSearchParams.set('providerName', encodeURIComponent(updatedFilters.provider.providerName));
    }
    
    // Update URL
    setSearchParams(newSearchParams);
    
    // Force immediate query refresh
    await forceRefreshQueries();
  }, [filters, setSearchParams, forceRefreshQueries]);

  // Initialize time range and provider filter hooks
  const timeRangeFilters = useTimeRangeFilters(filters.timeRange, updateFilters);
  const providerFilters = useProviderFilters(filters.provider, updateFilters);

  const getApiDateParams = useCallback(() => {
    // Ensure providerId is properly cleaned
    const cleanProviderId = filters.provider.providerId && filters.provider.providerId !== 'undefined' 
      ? filters.provider.providerId 
      : undefined;
    
    const params = {
      startDate: filters.timeRange.from.toISOString(),
      endDate: filters.timeRange.to.toISOString(),
      providerId: cleanProviderId
    };
    
    console.log('🌐 API params generated:', params);
    return params;
  }, [filters]);

  const getDisplayContext = useCallback(() => {
    const parts = [];
    
    if (filters.provider.providerName) {
      parts.push(`for ${filters.provider.providerName}`);
    }
    
    if (filters.timeRange.preset !== '24h') {
      parts.push(`in ${timeRangeFilters.getTimeRangeDisplayLabel().toLowerCase()}`);
    }
    
    return parts.length > 0 ? parts.join(' ') : '';
  }, [filters, timeRangeFilters.getTimeRangeDisplayLabel]);

  return {
    filters,
    ...timeRangeFilters,
    ...providerFilters,
    getApiDateParams,
    getDisplayContext,
    invalidateDashboardQueries: forceRefreshQueries
  };
};

// Re-export types for backward compatibility
export type { TimeRangePreset, DashboardFiltersState, TimeRangeState, ProviderState };
export { TIME_RANGE_PRESETS };
