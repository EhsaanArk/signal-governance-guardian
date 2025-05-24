
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/lib/api/dashboardService';
import { useDashboardContext } from './useDashboardContext';
import { queryKeys, defaultQueryOptions } from '@/lib/utils/queryKeys';
import { DashboardDataTransformers } from '@/lib/transformers/DashboardDataTransformers';

export const useDashboardData = () => {
  const { getApiDateParams, filters } = useDashboardContext();
  const { startDate, endDate, providerId } = getApiDateParams();

  console.log('📊 Dashboard data hook - current filters:', filters);
  console.log('📊 Dashboard data hook - API params:', { startDate, endDate, providerId });

  // Fetch raw metrics data
  const { data: rawMetrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: queryKeys.dashboard.metrics(startDate, endDate, providerId, filters.timeRange.preset),
    queryFn: () => {
      console.log('📊 Fetching dashboard metrics with params:', { startDate, endDate, providerId });
      return DashboardService.fetchMetrics({ startDate, endDate, providerId });
    },
    ...defaultQueryOptions,
    refetchInterval: 30000,
  });

  // Fetch raw heatmap data
  const { data: rawHeatmapData, isLoading: heatmapLoading, error: heatmapError } = useQuery({
    queryKey: queryKeys.dashboard.heatmap(startDate, endDate, providerId, filters.timeRange.preset),
    queryFn: () => {
      console.log('🔥 Fetching heatmap with params:', { startDate, endDate, providerId });
      return DashboardService.fetchHeatmapData({ startDate, endDate, providerId });
    },
    ...defaultQueryOptions,
  });

  // Transform the data for UI consumption
  const transformedHeatmapData = rawHeatmapData 
    ? DashboardDataTransformers.transformHeatmapData(rawHeatmapData)
    : undefined;

  return {
    // Raw data
    rawMetrics,
    rawHeatmapData,
    
    // Transformed data
    transformedHeatmapData,
    
    // Loading states
    metricsLoading,
    heatmapLoading,
    isLoading: metricsLoading || heatmapLoading,
    
    // Error states
    metricsError,
    heatmapError,
    hasError: !!metricsError || !!heatmapError,
  };
};
