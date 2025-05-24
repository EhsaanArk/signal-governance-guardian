
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/utils/queryKeys';

export type TimeRangePreset = '24h' | '7d' | '30d' | '90d' | 'custom';

export interface TimeRangeState {
  preset: TimeRangePreset;
  from: Date;
  to: Date;
}

export interface ProviderState {
  providerId: string | null;
  providerName: string | null;
}

export interface DashboardFiltersState {
  timeRange: TimeRangeState;
  provider: ProviderState;
}

export const TIME_RANGE_PRESETS = {
  '24h': { label: 'Last 24 hours', hours: 24 },
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
  'custom': { label: 'Custom range' }
} as const;

const getDateRangeFromPreset = (preset: TimeRangePreset): { from: Date; to: Date } => {
  const now = new Date();
  const to = now;
  
  switch (preset) {
    case '24h':
      return { from: new Date(now.getTime() - 24 * 60 * 60 * 1000), to };
    case '7d':
      return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to };
    case '30d':
      return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to };
    case '90d':
      return { from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to };
    default:
      return { from: new Date(now.getTime() - 24 * 60 * 60 * 1000), to };
  }
};

const getComparePeriod = (from: Date, to: Date): { from: Date; to: Date } => {
  const duration = to.getTime() - from.getTime();
  const compareFrom = new Date(from.getTime() - duration);
  const compareTo = new Date(from.getTime());
  return { from: compareFrom, to: compareTo };
};

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

  const setTimeRangePreset = useCallback(async (preset: TimeRangePreset) => {
    console.log('📅 Setting time range preset:', preset);
    if (preset === 'custom') {
      await updateFilters({ timeRange: { ...filters.timeRange, preset } });
    } else {
      const { from, to } = getDateRangeFromPreset(preset);
      await updateFilters({ timeRange: { preset, from, to } });
    }
  }, [updateFilters, filters.timeRange]);

  const setCustomTimeRange = useCallback(async (from: Date, to: Date) => {
    const maxDays = 180;
    const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > maxDays) {
      throw new Error(`Date range cannot exceed ${maxDays} days`);
    }
    
    console.log('📅 Setting custom time range:', { from: from.toISOString(), to: to.toISOString() });
    await updateFilters({ timeRange: { preset: 'custom', from, to } });
  }, [updateFilters]);

  const setProvider = useCallback(async (providerId: string | null, providerName: string | null) => {
    console.log('👤 Setting provider:', { providerId, providerName });
    await updateFilters({ provider: { providerId, providerName } });
  }, [updateFilters]);

  const getComparePeriodDates = useCallback(() => {
    return getComparePeriod(filters.timeRange.from, filters.timeRange.to);
  }, [filters.timeRange]);

  const getTimeRangeDisplayLabel = useCallback(() => {
    if (filters.timeRange.preset === 'custom') {
      return `${filters.timeRange.from.toLocaleDateString()} - ${filters.timeRange.to.toLocaleDateString()}`;
    }
    return TIME_RANGE_PRESETS[filters.timeRange.preset].label;
  }, [filters.timeRange]);

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
      parts.push(`in ${getTimeRangeDisplayLabel().toLowerCase()}`);
    }
    
    return parts.length > 0 ? parts.join(' ') : '';
  }, [filters, getTimeRangeDisplayLabel]);

  return {
    filters,
    setTimeRangePreset,
    setCustomTimeRange,
    setProvider,
    getComparePeriodDates,
    getTimeRangeDisplayLabel,
    getApiDateParams,
    getDisplayContext,
    isCustomTimeRange: filters.timeRange.preset === 'custom',
    isProviderFiltered: !!filters.provider.providerId,
    invalidateDashboardQueries: forceRefreshQueries
  };
};
