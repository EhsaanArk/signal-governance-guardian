
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/utils/queryKeys';

export const useFilterTransitions = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const queryClient = useQueryClient();

  const handleFilterChange = useCallback(async (callback: () => Promise<void>) => {
    console.log('🔄 Starting filter transition');
    setIsTransitioning(true);
    
    try {
      // Execute the filter change and wait for completion
      await callback();
      
      console.log('✅ Filter transition complete');
    } catch (error) {
      console.error('❌ Filter transition failed:', error);
    } finally {
      // Always end transition state
      setIsTransitioning(false);
    }
  }, []);

  const invalidateAllDashboardData = useCallback(async () => {
    console.log('🔄 Manual invalidation of all dashboard data');
    await queryClient.cancelQueries({ queryKey: queryKeys.dashboard.all });
    queryClient.removeQueries({ queryKey: queryKeys.dashboard.all });
    await queryClient.invalidateQueries({ 
      queryKey: queryKeys.dashboard.all,
      refetchType: 'active'
    });
  }, [queryClient]);

  return {
    isTransitioning,
    handleFilterChange,
    invalidateAllDashboardData
  };
};
