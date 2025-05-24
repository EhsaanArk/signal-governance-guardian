
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
      // Execute the filter change
      await callback();
      
      // Additional forced refresh to ensure data loads
      console.log('🔄 Performing additional data refresh');
      await queryClient.cancelQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.removeQueries({ queryKey: queryKeys.dashboard.all });
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.dashboard.all,
        refetchType: 'active'
      });
      
      console.log('✅ Filter transition complete with data refresh');
    } catch (error) {
      console.error('❌ Filter transition failed:', error);
    } finally {
      // Small delay to ensure UI updates properly
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }
  }, [queryClient]);

  const invalidateAllDashboardData = useCallback(async () => {
    console.log('🔄 Manual invalidation of all dashboard data');
    setIsTransitioning(true);
    
    try {
      await queryClient.cancelQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.removeQueries({ queryKey: queryKeys.dashboard.all });
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.dashboard.all,
        refetchType: 'active'
      });
      queryClient.resetQueries({ queryKey: queryKeys.dashboard.all });
    } catch (error) {
      console.error('❌ Manual invalidation failed:', error);
    } finally {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }
  }, [queryClient]);

  return {
    isTransitioning,
    handleFilterChange,
    invalidateAllDashboardData
  };
};
