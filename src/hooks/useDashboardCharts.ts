
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHeatmapData, fetchTopBreachedRules } from '@/lib/api/dashboard';
import { Market } from '@/types/database';

export const useDashboardCharts = () => {
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');

  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ['dashboard-heatmap'],
    queryFn: fetchHeatmapData,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: topRulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['dashboard-top-rules', selectedMarket],
    queryFn: () => fetchTopBreachedRules(selectedMarket),
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
