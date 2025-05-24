
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { DashboardService } from '@/lib/api/dashboardService';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { queryKeys, defaultQueryOptions } from '@/lib/utils/queryKeys';
import { KPIMetricsService } from '@/lib/services/KPIMetricsService';
import { NavigationService } from '@/lib/services/NavigationService';
import { AlertTriangle } from 'lucide-react';

const DashboardKPICards = () => {
  const navigate = useNavigate();
  const { filters, getApiDateParams, context } = useDashboardContext();
  
  const { startDate, endDate, providerId } = getApiDateParams();
  
  console.log('📊 KPI Cards - Filter state:', filters);
  console.log('📊 KPI Cards - API params:', { startDate, endDate, providerId });
  
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.metrics(startDate, endDate, providerId, filters.timeRange.preset),
    queryFn: () => {
      console.log('📊 Fetching KPI metrics with params:', { startDate, endDate, providerId });
      return DashboardService.fetchMetrics({ startDate, endDate, providerId });
    },
    ...defaultQueryOptions,
    refetchInterval: 30000,
  });

  const navigationHandlers = {
    navigateToCooldowns: () => navigate('/admin/cooldowns'),
    navigateToBreaches: () => navigate(NavigationService.buildBreachesUrl({
      timeRange: filters.timeRange,
      provider: filters.provider
    })),
    navigateToProviders: () => navigate(NavigationService.buildProvidersUrl({ sort: 'winrate' })),
    navigateToProvidersReview: () => navigate(NavigationService.buildProvidersUrl({ status: 'review' }))
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="min-w-0">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Dashboard data unavailable – retry</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cards = KPIMetricsService.buildKPICards(metrics, context, navigationHandlers);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = card.change > 0;
          const hasSignificantChange = KPIMetricsService.hasSignificantChange(card.change);
          const deltaColor = KPIMetricsService.getDeltaColor(card.change, card.isGoodWhenIncreasing);
          
          return (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow min-w-0"
              onClick={card.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate cursor-help">
                      {card.title}
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{card.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {card.timeLabel && (
                      <div className="text-xs text-muted-foreground mb-1">{card.timeLabel}</div>
                    )}
                    <div className="text-xl sm:text-2xl font-bold truncate">
                      {typeof card.displayValue === 'number' ? `${card.displayValue}%` : card.value}
                    </div>
                  </div>
                  {hasSignificantChange && (
                    <div className={`flex items-center text-xs flex-shrink-0 ml-2 ${deltaColor}`}>
                      {isPositive ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(card.change)}%
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default DashboardKPICards;
