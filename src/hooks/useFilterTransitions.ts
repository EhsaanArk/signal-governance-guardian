
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
      
      // Intelligent query invalidation - only invalidate dashboard queries
      console.log('🔄 Invalidating dashboard queries');
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.dashboard.all,
        refetchType: 'active'
      });
      
      console.log('✅ Filter transition complete');
    } catch (error) {
      console.error('❌ Filter transition failed:', error);
    } finally {
      // Minimal delay for smooth UI transition
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }
  }, [queryClient]);

  const invalidateAllDashboardData = useCallback(async () => {
    console.log('🔄 Manual invalidation of dashboard data');
    setIsTransitioning(true);
    
    try {
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.dashboard.all,
        refetchType: 'active'
      });
      console.log('✅ Manual invalidation complete');
    } catch (error) {
      console.error('❌ Manual invalidation failed:', error);
    } finally {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }
  }, [queryClient]);

  return {
    isTransitioning,
    handleFilterChange,
    invalidateAllDashboardData
  };
};
