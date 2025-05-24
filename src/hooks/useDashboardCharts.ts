
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHeatmapData, fetchTopBreachedRules } from '@/lib/api/dashboard';
import { Market } from '@/types/database';
import { useDashboardFilters } from './useDashboardFilters';

export const useDashboardCharts = () => {
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const { getApiDateParams, filters } = useDashboardFilters();

  console.log('📊 Dashboard charts hook - current filters:', filters);

  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ['dashboard-heatmap', getApiDateParams()],
    queryFn: () => {
      const { startDate, endDate, providerId } = getApiDateParams();
      console.log('🔥 Fetching heatmap with params:', { startDate, endDate, providerId });
      return fetchHeatmapData(startDate, endDate, providerId);
    },
    refetchInterval: 60000,
  });

  const { data: topRulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['dashboard-top-rules', selectedMarket, getApiDateParams()],
    queryFn: () => {
      const { startDate, endDate, providerId } = getApiDateParams();
      console.log('📈 Fetching top rules with params:', { 
        selectedMarket, 
        startDate, 
        endDate, 
        providerId,
        timeRangePreset: filters.timeRange.preset
      });
      return fetchTopBreachedRules(selectedMarket, startDate, endDate, providerId);
    },
    refetchInterval: 60000,
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
