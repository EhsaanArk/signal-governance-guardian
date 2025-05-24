
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/lib/api/dashboardService';
import { Market } from '@/types/database';
import { useDashboardContext } from './useDashboardContext';
import { queryKeys, defaultQueryOptions } from '@/lib/utils/queryKeys';
import { DashboardDataTransformers } from '@/lib/transformers/DashboardDataTransformers';

export const useDashboardCharts = () => {
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const { getApiDateParams, filters } = useDashboardContext();

  console.log('📊 Dashboard charts hook - current filters:', filters);

  const { startDate, endDate, providerId } = getApiDateParams();

  const { data: rawTopRulesData, isLoading: rulesLoading } = useQuery({
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

  // Transform the top rules data
  const transformedTopRulesData = rawTopRulesData 
    ? DashboardDataTransformers.transformTopRulesData(rawTopRulesData)
    : undefined;

  return {
    // Raw data
    topRulesData: rawTopRulesData,
    
    // Transformed data  
    transformedTopRulesData,
    
    // Loading states
    rulesLoading,
    
    // UI state
    selectedMarket,
    setSelectedMarket,
  };
};
