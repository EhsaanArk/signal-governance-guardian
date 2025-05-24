
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
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
      <Card className="col-span-full">
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
      value: metrics?.activeCooldowns || 0,
      icon: Clock,
      change: metrics?.cooldownChange || 0,
      onClick: () => navigate('/admin/cooldowns'),
    },
    {
      title: '24-h Breaches',
      value: metrics?.breaches24h || 0,
      icon: AlertTriangle,
      change: metrics?.breachChange || 0,
      onClick: () => navigate('/admin/breaches?period=24h'),
    },
    {
      title: '24-h Win-rate',
      value: `${metrics?.winRate24h || 0}%`,
      icon: TrendingUp,
      change: metrics?.winRateChange || 0,
      onClick: () => navigate('/admin/providers?sort=winrate'),
    },
    {
      title: 'Providers In Review',
      value: metrics?.providersInReview || 0,
      icon: Users,
      change: metrics?.reviewChange || 0,
      onClick: () => navigate('/admin/providers?status=review'),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change > 0;
        const hasSignificantChange = Math.abs(card.change) >= 5;
        
        return (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={card.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{card.value}</div>
                {hasSignificantChange && (
                  <div className={`flex items-center text-xs ${
                    isPositive ? 'text-red-600' : 'text-green-600'
                  }`}>
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
  );
};

export default DashboardKPICards;
