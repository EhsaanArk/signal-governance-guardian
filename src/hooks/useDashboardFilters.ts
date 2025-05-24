
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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

  const updateFilters = useCallback(async (newFilters: Partial<DashboardFiltersState>) => {
    console.log('🔄 Starting filter update with:', newFilters);
    const updatedFilters = { ...filters, ...newFilters };
    
    // Update state immediately
    setFilters(updatedFilters);
    console.log('📊 Updated filter state:', updatedFilters);
    
    // Update URL parameters
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
    console.log('🌐 Updated URL params:', newSearchParams.toString());
  }, [filters, setSearchParams]);

  // Initialize time range and provider filter hooks
  const timeRangeFilters = useTimeRangeFilters(filters.timeRange, updateFilters);
  const providerFilters = useProviderFilters(filters.provider, updateFilters);

  const getApiDateParams = useCallback(() => {
    // Clean provider ID handling
    const cleanProviderId = filters.provider.providerId && filters.provider.providerId !== 'undefined' 
      ? filters.provider.providerId 
      : undefined;
    
    const params = {
      startDate: filters.timeRange.from.toISOString(),
      endDate: filters.timeRange.to.toISOString(),
      providerId: cleanProviderId
    };
    
    console.log('🌐 Generated API params:', params);
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
    getDisplayContext
  };
};

// Re-export types for backward compatibility
export type { TimeRangePreset, DashboardFiltersState, TimeRangeState, ProviderState };
export { TIME_RANGE_PRESETS };
