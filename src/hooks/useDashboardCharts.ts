
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/lib/api/dashboardService';
import { Market } from '@/types/database';
import { useDashboardFilters } from './useDashboardFilters';
import { queryKeys, defaultQueryOptions } from '@/lib/utils/queryKeys';

export const useDashboardCharts = () => {
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const { getApiDateParams, filters } = useDashboardFilters();

  console.log('📊 Dashboard charts hook - current filters:', filters);

  const { startDate, endDate, providerId } = getApiDateParams();

  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: queryKeys.dashboard.heatmap(startDate, endDate, providerId, filters.timeRange.preset),
    queryFn: () => {
      console.log('🔥 Fetching heatmap with params:', { startDate, endDate, providerId });
      return DashboardService.fetchHeatmapData({ startDate, endDate, providerId });
    },
    ...defaultQueryOptions,
  });

  const { data: topRulesData, isLoading: rulesLoading } = useQuery({
    queryKey: queryKeys.dashboard.topRules(selectedMarket, startDate, endDate, providerId, filters.timeRange.preset),
    queryFn: () => {
      console.log('📈 Fetching top rules with params:', { 
        selectedMarket, 
        startDate, 
        endDate, 
        providerId,
        timeRangePreset: filters.timeRange.preset
      });
      return DashboardService.fetchTopBreachedRules(selectedMarket, { startDate, endDate, providerId });
    },
    ...defaultQueryOptions,
  });

  return {
    heatmapData,
    heatmapLoading,
    topRulesData,
    rulesLoading,
    selectedMarket,
    setSelectedMarket,
  };
};
