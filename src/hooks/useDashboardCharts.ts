
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHeatmapData, fetchTopBreachedRules } from '@/lib/api/dashboard';
import { Market } from '@/types/database';
import { useDashboardTimeRange } from './useDashboardTimeRange';

export const useDashboardCharts = () => {
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const { getApiDateParams } = useDashboardTimeRange();

  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ['dashboard-heatmap', getApiDateParams()],
    queryFn: () => {
      const { startDate, endDate } = getApiDateParams();
      return fetchHeatmapData(startDate, endDate);
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: topRulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['dashboard-top-rules', selectedMarket, getApiDateParams()],
    queryFn: () => {
      const { startDate, endDate } = getApiDateParams();
      return fetchTopBreachedRules(selectedMarket, startDate, endDate);
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
