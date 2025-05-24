
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { KPIMetricsService } from '@/lib/services/KPIMetricsService';
import { NavigationService } from '@/lib/services/NavigationService';
import KPICardPresentation from './presentation/KPICardPresentation';

const DashboardKPICards = () => {
  const navigate = useNavigate();
  const { filters, context } = useDashboardContext();
  const { rawMetrics, metricsLoading, metricsError } = useDashboardData();
  
  console.log('📊 KPI Cards - Filter state:', filters);

  const navigationHandlers = {
    navigateToCooldowns: () => navigate('/admin/cooldowns'),
    navigateToBreaches: () => navigate(NavigationService.buildBreachesUrl({
      timeRange: filters.timeRange,
      provider: filters.provider
    })),
    navigateToProviders: () => navigate(NavigationService.buildProvidersUrl({ sort: 'winrate' })),
    navigateToProvidersReview: () => navigate(NavigationService.buildProvidersUrl({ status: 'review' }))
  };

  if (metricsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="min-w-0">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (metricsError) {
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

  const cards = KPIMetricsService.buildKPICards(rawMetrics, context, navigationHandlers);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, index) => {
          const hasSignificantChange = KPIMetricsService.hasSignificantChange(card.change);
          const deltaColor = KPIMetricsService.getDeltaColor(card.change, card.isGoodWhenIncreasing);
          
          return (
            <KPICardPresentation
              key={index}
              card={card}
              hasSignificantChange={hasSignificantChange}
              deltaColor={deltaColor}
            />
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default DashboardKPICards;
