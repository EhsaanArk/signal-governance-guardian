import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { Market } from '@/types/database';
import { TimeRangePreset, TIME_RANGE_PRESETS } from '@/components/breaches/TimeRangeSelector';
import { RuleType, ActionType } from '@/types/breach';

export interface BreachFiltersState {
  timeRangePreset: TimeRangePreset;
  dateRange: DateRange | undefined;
  providerId: string | null;
  providerName: string | null;
  market: Market | 'All';
  ruleSetId: string;
  providerSearch: string;
  selectedRuleTypes: RuleType[];
  selectedActions: ActionType[];
}

const getDateRangeFromPreset = (preset: TimeRangePreset): DateRange => {
  const now = new Date();
  
  switch (preset) {
    case '24h':
      const from24h = new Date(now);
      from24h.setDate(from24h.getDate() - 1);
      from24h.setHours(0, 0, 0, 0);
      return { from: from24h, to: now };
    case '7d':
      const from7d = new Date(now);
      from7d.setDate(from7d.getDate() - 7);
      from7d.setHours(0, 0, 0, 0);
      return { from: from7d, to: now };
    case '30d':
      const from30d = new Date(now);
      from30d.setDate(from30d.getDate() - 30);
      from30d.setHours(0, 0, 0, 0);
      return { from: from30d, to: now };
    case '90d':
      const from90d = new Date(now);
      from90d.setDate(from90d.getDate() - 90);
      from90d.setHours(0, 0, 0, 0);
      return { from: from90d, to: now };
    default:
      const fromDefault = new Date(now);
      fromDefault.setDate(fromDefault.getDate() - 1);
      fromDefault.setHours(0, 0, 0, 0);
      return { from: fromDefault, to: now };
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
    const ruleParam = searchParams.get('rule') || searchParams.get('ruleSet');
    const ruleTypeParam = searchParams.get('ruleType');
    const actionParam = searchParams.get('action');
    
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

    // Parse rule types from URL
    const selectedRuleTypes: RuleType[] = ruleTypeParam 
      ? ruleTypeParam.split(',').filter(rt => ['CO', 'GD', 'AC', 'PC'].includes(rt)) as RuleType[]
      : [];

    // Parse actions from URL
    const selectedActions: ActionType[] = actionParam 
      ? actionParam.split(',').filter(a => ['paused', 'rejected', 'suspended'].includes(a)) as ActionType[]
      : [];

    return {
      timeRangePreset,
      dateRange,
      providerId: providerParam || null,
      providerName: providerNameParam || null,
      market: marketParam || 'All',
      ruleSetId: ruleParam || 'all',
      providerSearch: '',
      selectedRuleTypes,
      selectedActions
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
    
    // Handle rule set param - use 'rule' as primary param name for consistency
    if (updatedFilters.ruleSetId !== 'all') {
      newSearchParams.set('rule', updatedFilters.ruleSetId);
      newSearchParams.delete('ruleSet'); // Clean up any old ruleSet params
    } else {
      newSearchParams.delete('rule');
      newSearchParams.delete('ruleSet');
    }
    
    // Handle rule type params
    if (updatedFilters.selectedRuleTypes.length > 0) {
      newSearchParams.set('ruleType', updatedFilters.selectedRuleTypes.join(','));
    } else {
      newSearchParams.delete('ruleType');
    }
    
    // Handle action params
    if (updatedFilters.selectedActions.length > 0) {
      newSearchParams.set('action', updatedFilters.selectedActions.join(','));
    } else {
      newSearchParams.delete('action');
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

  const setRuleTypes = useCallback((selectedRuleTypes: RuleType[]) => {
    updateFilters({ selectedRuleTypes });
  }, [updateFilters]);

  const setActions = useCallback((selectedActions: ActionType[]) => {
    updateFilters({ selectedActions });
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
      providerSearch: '',
      selectedRuleTypes: [],
      selectedActions: []
    });
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const hasActiveFilters = useCallback(() => {
    return filters.timeRangePreset !== '24h' ||
           filters.providerId !== null ||
           filters.market !== 'All' ||
           filters.ruleSetId !== 'all' ||
           filters.selectedRuleTypes.length > 0 ||
           filters.selectedActions.length > 0;
  }, [filters]);

  return {
    filters,
    setTimeRangePreset,
    setCustomDateRange,
    setProvider,
    setMarket,
    setRuleSet,
    setProviderSearch,
    setRuleTypes,
    setActions,
    clearAllFilters,
    hasActiveFilters: hasActiveFilters()
  };
};
