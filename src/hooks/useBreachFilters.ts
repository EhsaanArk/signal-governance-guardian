
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { Market } from '@/types/database';
import { TimeRangePreset, TIME_RANGE_PRESETS } from '@/components/breaches/TimeRangeSelector';

export interface BreachFiltersState {
  timeRangePreset: TimeRangePreset;
  dateRange: DateRange | undefined;
  providerId: string | null;
  providerName: string | null;
  market: Market | 'All';
  ruleSetId: string;
  providerSearch: string;
}

const getDateRangeFromPreset = (preset: TimeRangePreset): DateRange => {
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

export const useBreachFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState<BreachFiltersState>(() => {
    // Initialize from URL parameters
    const rangeParam = searchParams.get('range');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const providerParam = searchParams.get('provider');
    const providerNameParam = searchParams.get('providerName');
    const marketParam = searchParams.get('market') as Market | 'All' | null;
    const ruleParam = searchParams.get('rule');
    
    let timeRangePreset: TimeRangePreset = '24h';
    let dateRange: DateRange | undefined;
    
    if (fromParam && toParam) {
      timeRangePreset = 'custom';
      dateRange = {
        from: new Date(fromParam),
        to: new Date(toParam)
      };
    } else if (rangeParam && rangeParam in TIME_RANGE_PRESETS) {
      timeRangePreset = rangeParam as TimeRangePreset;
      dateRange = getDateRangeFromPreset(timeRangePreset);
    } else {
      dateRange = getDateRangeFromPreset('24h');
    }

    return {
      timeRangePreset,
      dateRange,
      providerId: providerParam || null,
      providerName: providerNameParam || null,
      market: marketParam || 'All',
      ruleSetId: ruleParam || 'all',
      providerSearch: ''
    };
  });

  const updateFilters = useCallback((newFilters: Partial<BreachFiltersState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Handle time range params
    if (updatedFilters.timeRangePreset === 'custom' && updatedFilters.dateRange?.from && updatedFilters.dateRange?.to) {
      newSearchParams.set('from', updatedFilters.dateRange.from.toISOString().split('T')[0]);
      newSearchParams.set('to', updatedFilters.dateRange.to.toISOString().split('T')[0]);
      newSearchParams.delete('range');
    } else {
      newSearchParams.set('range', updatedFilters.timeRangePreset);
      newSearchParams.delete('from');
      newSearchParams.delete('to');
    }
    
    // Handle provider params
    if (updatedFilters.providerId) {
      newSearchParams.set('provider', updatedFilters.providerId);
      if (updatedFilters.providerName) {
        newSearchParams.set('providerName', updatedFilters.providerName);
      }
    } else {
      newSearchParams.delete('provider');
      newSearchParams.delete('providerName');
    }
    
    // Handle market param
    if (updatedFilters.market !== 'All') {
      newSearchParams.set('market', updatedFilters.market.toLowerCase());
    } else {
      newSearchParams.delete('market');
    }
    
    // Handle rule set param
    if (updatedFilters.ruleSetId !== 'all') {
      newSearchParams.set('rule', updatedFilters.ruleSetId);
    } else {
      newSearchParams.delete('rule');
    }
    
    setSearchParams(newSearchParams);
  }, [filters, searchParams, setSearchParams]);

  const setTimeRangePreset = useCallback((preset: TimeRangePreset) => {
    if (preset === 'custom') {
      updateFilters({ timeRangePreset: preset });
    } else {
      const dateRange = getDateRangeFromPreset(preset);
      updateFilters({ timeRangePreset: preset, dateRange });
    }
  }, [updateFilters]);

  const setCustomDateRange = useCallback((dateRange: DateRange | undefined) => {
    updateFilters({ dateRange });
  }, [updateFilters]);

  const setProvider = useCallback((providerId: string | null, providerName: string | null) => {
    updateFilters({ providerId, providerName });
  }, [updateFilters]);

  const setMarket = useCallback((market: Market | 'All') => {
    updateFilters({ market });
  }, [updateFilters]);

  const setRuleSet = useCallback((ruleSetId: string) => {
    updateFilters({ ruleSetId });
  }, [updateFilters]);

  const setProviderSearch = useCallback((providerSearch: string) => {
    updateFilters({ providerSearch });
  }, [updateFilters]);

  const clearAllFilters = useCallback(() => {
    const defaultDateRange = getDateRangeFromPreset('24h');
    setFilters({
      timeRangePreset: '24h',
      dateRange: defaultDateRange,
      providerId: null,
      providerName: null,
      market: 'All',
      ruleSetId: 'all',
      providerSearch: ''
    });
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const hasActiveFilters = useCallback(() => {
    return filters.timeRangePreset !== '24h' ||
           filters.providerId !== null ||
           filters.market !== 'All' ||
           filters.ruleSetId !== 'all';
  }, [filters]);

  return {
    filters,
    setTimeRangePreset,
    setCustomDateRange,
    setProvider,
    setMarket,
    setRuleSet,
    setProviderSearch,
    clearAllFilters,
    hasActiveFilters: hasActiveFilters()
  };
};
