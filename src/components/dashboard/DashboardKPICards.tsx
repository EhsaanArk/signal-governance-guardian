
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUp, ArrowDown, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { fetchDashboardMetrics } from '@/lib/api/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';

interface KPICard {
  title: string;
  tooltip: string;
  value: string | number;
  displayValue?: number;
  timeLabel?: string;
  icon: React.ElementType;
  change: number;
  isGoodWhenIncreasing: boolean;
  onClick: () => void;
}

const DashboardKPICards = () => {
  const navigate = useNavigate();
  const { filters, getApiDateParams, getDisplayContext } = useDashboardFilters();
  
  const { startDate, endDate, providerId } = getApiDateParams();
  
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics', startDate, endDate, providerId],
    queryFn: () => {
      return fetchDashboardMetrics(startDate, endDate, providerId);
    },
    refetchInterval: 30000,
  });

  const getTimeLabel = () => {
    switch (filters.timeRange.preset) {
      case '24h': return '24-h';
      case '7d': return '7-d';
      case '30d': return '30-d';
      case '90d': return '90-d';
      case 'custom': return 'Period';
      default: return '24-h';
    }
  };

  const getPeriodLabel = () => {
    switch (filters.timeRange.preset) {
      case '24h': return 'last 24 hours';
      case '7d': return 'last 7 days';
      case '30d': return 'last 30 days';
      case '90d': return 'last 90 days';
      case 'custom': return 'selected period';
      default: return 'last 24 hours';
    }
  };

  const getProviderContext = () => {
    const context = getDisplayContext();
    return context ? ` ${context}` : '';
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

  const cards: KPICard[] = [
    {
      title: 'Active Cool-downs',
      tooltip: `Sum of unique providers currently in any cooldown period${getProviderContext()}`,
      value: metrics?.activeCooldowns || 0,
      icon: Clock,
      change: metrics?.cooldownChange || 0,
      isGoodWhenIncreasing: false,
      onClick: () => navigate('/admin/cooldowns'),
    },
    {
      title: `${getTimeLabel()} Breaches`,
      tooltip: `Total number of rule breaches detected in the ${getPeriodLabel()}${getProviderContext()}`,
      value: metrics?.breaches || 0,
      icon: AlertTriangle,
      change: metrics?.breachChange || 0,
      isGoodWhenIncreasing: false,
      onClick: () => {
        const params = new URLSearchParams();
        if (filters.timeRange.preset !== '24h') {
          params.set('from', filters.timeRange.from.toISOString().split('T')[0]);
          params.set('to', filters.timeRange.to.toISOString().split('T')[0]);
        } else {
          params.set('period', '24h');
        }
        if (filters.provider.providerId) {
          params.set('provider', filters.provider.providerId);
        }
        navigate(`/admin/breaches?${params.toString()}`);
      },
    },
    {
      title: `${getTimeLabel()} Win-rate`,
      tooltip: `Percentage of profitable trades executed in the ${getPeriodLabel()}${getProviderContext()}`,
      value: `${metrics?.winRate || 0}%`,
      displayValue: metrics?.winRate || 0,
      timeLabel: getTimeLabel(),
      icon: TrendingUp,
      change: metrics?.winRateChange || 0,
      isGoodWhenIncreasing: true,
      onClick: () => navigate('/admin/providers?sort=winrate'),
    },
    {
      title: 'Providers In Review',
      tooltip: 'Number of signal providers currently under performance review',
      value: metrics?.providersInReview || 0,
      icon: Users,
      change: metrics?.reviewChange || 0,
      isGoodWhenIncreasing: false,
      onClick: () => navigate('/admin/providers?status=review'),
    },
  ];

  const getDeltaColor = (change: number, isGoodWhenIncreasing: boolean) => {
    if (change === 0) return 'text-muted-foreground';
    
    const isIncreasing = change > 0;
    const isGoodChange = isGoodWhenIncreasing ? isIncreasing : !isIncreasing;
    
    return isGoodChange ? 'text-green-600' : 'text-red-600';
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = card.change > 0;
          const hasSignificantChange = Math.abs(card.change) >= 5;
          const deltaColor = getDeltaColor(card.change, card.isGoodWhenIncreasing);
          
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
