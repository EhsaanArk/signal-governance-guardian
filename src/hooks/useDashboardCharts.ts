
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHeatmapData, fetchTopBreachedRules } from '@/lib/api/dashboard';
import { Market } from '@/types/database';
import { useDashboardFilters } from './useDashboardFilters';

export const useDashboardCharts = () => {
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const { getApiDateParams } = useDashboardFilters();

  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ['dashboard-heatmap', getApiDateParams()],
    queryFn: () => {
      const { startDate, endDate, providerId } = getApiDateParams();
      return fetchHeatmapData(startDate, endDate, providerId);
    },
    refetchInterval: 60000,
  });

  const { data: topRulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['dashboard-top-rules', selectedMarket, getApiDateParams()],
    queryFn: () => {
      const { startDate, endDate, providerId } = getApiDateParams();
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
