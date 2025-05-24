
import { useCallback } from 'react';
import { TimeRangePreset, TimeRangeState, TIME_RANGE_PRESETS } from '@/types/dashboardFilters';
import { getDateRangeFromPreset, getComparePeriod, validateCustomDateRange } from '@/lib/utils/timeRangeUtils';

export const useTimeRangeFilters = (
  timeRange: TimeRangeState,
  updateFilters: (filters: any) => Promise<void>
) => {
  const setTimeRangePreset = useCallback(async (preset: TimeRangePreset) => {
    console.log('📅 Setting time range preset:', preset);
    if (preset === 'custom') {
      await updateFilters({ timeRange: { ...timeRange, preset } });
    } else {
      const { from, to } = getDateRangeFromPreset(preset);
      await updateFilters({ timeRange: { preset, from, to } });
    }
  }, [updateFilters, timeRange]);

  const setCustomTimeRange = useCallback(async (from: Date, to: Date) => {
    validateCustomDateRange(from, to);
    
    console.log('📅 Setting custom time range:', { from: from.toISOString(), to: to.toISOString() });
    await updateFilters({ timeRange: { preset: 'custom', from, to } });
  }, [updateFilters]);

  const getComparePeriodDates = useCallback(() => {
    return getComparePeriod(timeRange.from, timeRange.to);
  }, [timeRange]);

  const getTimeRangeDisplayLabel = useCallback(() => {
    if (timeRange.preset === 'custom') {
      return `${timeRange.from.toLocaleDateString()} - ${timeRange.to.toLocaleDateString()}`;
    }
    return TIME_RANGE_PRESETS[timeRange.preset].label;
  }, [timeRange]);

  return {
    setTimeRangePreset,
    setCustomTimeRange,
    getComparePeriodDates,
    getTimeRangeDisplayLabel,
    isCustomTimeRange: timeRange.preset === 'custom'
  };
};
