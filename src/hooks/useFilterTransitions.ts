
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/utils/queryKeys';

export const useFilterTransitions = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const queryClient = useQueryClient();

  const handleFilterChange = async (callback: () => void) => {
    console.log('🔄 Starting filter transition');
    setIsTransitioning(true);
    
    // Execute the filter change immediately
    callback();
    
    // Force immediate invalidation and refetch
    console.log('🔄 Invalidating all dashboard queries');
    await queryClient.invalidateQueries({ 
      queryKey: queryKeys.dashboard.all,
      refetchType: 'active' // Force immediate refetch of active queries
    });
    
    // Clear all cached dashboard data to force fresh fetches
    queryClient.removeQueries({ queryKey: queryKeys.dashboard.all });
    
    // Small delay for UI feedback, then end transition
    setTimeout(() => {
      console.log('✅ Filter transition complete');
      setIsTransitioning(false);
    }, 500);
  };

  const invalidateAllDashboardData = () => {
    console.log('🔄 Manual invalidation of all dashboard data');
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    // Also remove cached data to force fresh fetch
    queryClient.removeQueries({ queryKey: queryKeys.dashboard.all });
  };

  return {
    isTransitioning,
    handleFilterChange,
    invalidateAllDashboardData
  };
};
