
import { useDashboardFilters, DashboardFiltersState } from './useDashboardFilters';
import { DashboardFiltersService, FilterContext } from '@/lib/services/DashboardFiltersService';

export const useDashboardContext = () => {
  const dashboardFilters = useDashboardFilters();
  
  const context: FilterContext = {
    provider: dashboardFilters.filters.provider,
    timeRange: dashboardFilters.filters.timeRange
  };
  
  const getDisplayContext = () => DashboardFiltersService.getDisplayContext(context);
  const getApiDateParams = () => DashboardFiltersService.getApiDateParams(context);
  const getContextualTitle = (baseTitle: string) => 
    DashboardFiltersService.getContextualTitle(baseTitle, context);
  
  return {
    ...dashboardFilters,
    context,
    getDisplayContext,
    getApiDateParams,
    getContextualTitle
  };
};
