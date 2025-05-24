
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DateRange } from 'react-day-picker';

export type TimeRangePreset = '24h' | '7d' | '30d' | '90d' | 'custom';

export interface TimeRangeState {
  preset: TimeRangePreset;
  from: Date;
  to: Date;
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

export const useDashboardTimeRange = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [timeRange, setTimeRange] = useState<TimeRangeState>(() => {
    // Initialize from URL parameters
    const rangeParam = searchParams.get('range');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    
    if (fromParam && toParam) {
      return {
        preset: 'custom',
        from: new Date(fromParam),
        to: new Date(toParam)
      };
    }
    
    if (rangeParam && rangeParam in TIME_RANGE_PRESETS) {
      const preset = rangeParam as TimeRangePreset;
      const { from, to } = getDateRangeFromPreset(preset);
      return { preset, from, to };
    }
    
    // Default to 24h
    const { from, to } = getDateRangeFromPreset('24h');
    return { preset: '24h', from, to };
  });

  const updateTimeRange = useCallback((newRange: Partial<TimeRangeState>) => {
    const updatedRange = { ...timeRange, ...newRange };
    setTimeRange(updatedRange);
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (updatedRange.preset === 'custom') {
      newSearchParams.set('from', updatedRange.from.toISOString().split('T')[0]);
      newSearchParams.set('to', updatedRange.to.toISOString().split('T')[0]);
      newSearchParams.delete('range');
    } else {
      newSearchParams.set('range', updatedRange.preset);
      newSearchParams.delete('from');
      newSearchParams.delete('to');
    }
    
    setSearchParams(newSearchParams);
  }, [timeRange, searchParams, setSearchParams]);

  const setPreset = useCallback((preset: TimeRangePreset) => {
    if (preset === 'custom') {
      // Don't auto-set dates for custom, let user pick
      updateTimeRange({ preset });
    } else {
      const { from, to } = getDateRangeFromPreset(preset);
      updateTimeRange({ preset, from, to });
    }
  }, [updateTimeRange]);

  const setCustomRange = useCallback((from: Date, to: Date) => {
    // Validate max 180 days
    const maxDays = 180;
    const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > maxDays) {
      throw new Error(`Date range cannot exceed ${maxDays} days`);
    }
    
    updateTimeRange({ preset: 'custom', from, to });
  }, [updateTimeRange]);

  const getComparePeriodDates = useCallback(() => {
    return getComparePeriod(timeRange.from, timeRange.to);
  }, [timeRange]);

  const getDisplayLabel = useCallback(() => {
    if (timeRange.preset === 'custom') {
      return `${timeRange.from.toLocaleDateString()} - ${timeRange.to.toLocaleDateString()}`;
    }
    return TIME_RANGE_PRESETS[timeRange.preset].label;
  }, [timeRange]);

  const getApiDateParams = useCallback(() => {
    return {
      startDate: timeRange.from.toISOString(),
      endDate: timeRange.to.toISOString()
    };
  }, [timeRange]);

  return {
    timeRange,
    setPreset,
    setCustomRange,
    getComparePeriodDates,
    getDisplayLabel,
    getApiDateParams,
    isCustomRange: timeRange.preset === 'custom'
  };
};
