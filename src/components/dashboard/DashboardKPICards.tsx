
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUp, ArrowDown, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { fetchDashboardMetrics } from '@/lib/api/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const DashboardKPICards = () => {
  const navigate = useNavigate();
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

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

  const cards = [
    {
      title: 'Active Cool-downs',
      tooltip: 'Sum of unique providers currently in any cooldown period',
      value: metrics?.activeCooldowns || 0,
      icon: Clock,
      change: metrics?.cooldownChange || 0,
      isGoodWhenIncreasing: false, // Bad when increasing
      onClick: () => navigate('/admin/cooldowns'),
    },
    {
      title: '24-h Breaches',
      tooltip: 'Total number of rule breaches detected in the last 24 hours',
      value: metrics?.breaches24h || 0,
      icon: AlertTriangle,
      change: metrics?.breachChange || 0,
      isGoodWhenIncreasing: false, // Bad when increasing
      onClick: () => navigate('/admin/breaches?period=24h'),
    },
    {
      title: '24-h Win-rate',
      tooltip: 'Percentage of profitable trades executed in the last 24 hours',
      value: `${metrics?.winRate24h || 0}%`,
      displayValue: metrics?.winRate24h || 0,
      timeLabel: '24-h',
      icon: TrendingUp,
      change: metrics?.winRateChange || 0,
      isGoodWhenIncreasing: true, // Good when increasing
      onClick: () => navigate('/admin/providers?sort=winrate'),
    },
    {
      title: 'Providers In Review',
      tooltip: 'Number of signal providers currently under performance review',
      value: metrics?.providersInReview || 0,
      icon: Users,
      change: metrics?.reviewChange || 0,
      isGoodWhenIncreasing: false, // Bad when increasing
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
