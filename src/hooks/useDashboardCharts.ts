
import { useQuery } from '@tanstack/react-query';
import { fetchHeatmapData, fetchTopBreachedRules } from '@/lib/api/dashboard';

export const useDashboardCharts = () => {
  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ['dashboard-heatmap'],
    queryFn: fetchHeatmapData,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: topRulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['dashboard-top-rules'],
    queryFn: fetchTopBreachedRules,
    refetchInterval: 60000,
  });

  return {
    heatmapData,
    heatmapLoading,
    topRulesData,
    rulesLoading,
  };
};
