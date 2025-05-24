
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/utils/queryKeys';

export const useFilterTransitions = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const queryClient = useQueryClient();

  const handleFilterChange = async (callback: () => void) => {
    setIsTransitioning(true);
    
    // Execute the filter change
    callback();
    
    // Wait for queries to invalidate
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    
    // Small delay to allow queries to start refetching
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const invalidateAllDashboardData = () => {
    console.log('🔄 Invalidating all dashboard data');
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };

  return {
    isTransitioning,
    handleFilterChange,
    invalidateAllDashboardData
  };
};
