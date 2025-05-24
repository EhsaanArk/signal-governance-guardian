
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchRecentBreaches } from '@/lib/api/breach-events';
import { fetchExpiringCooldowns } from '@/lib/api/cooldowns';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import ComplianceTooltip from '@/components/common/ComplianceTooltip';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import { queryKeys, defaultQueryOptions } from '@/lib/utils/queryKeys';
import { formatTimeAgo } from '@/lib/utils/dateUtils';
import { RecentBreach, ExpiringCooldown } from '@/lib/api/types';

const DashboardTables = () => {
  const navigate = useNavigate();
  const { getApiDateParams, getDisplayContext, filters } = useDashboardFilters();

  const { startDate, endDate, providerId } = getApiDateParams();

  console.log('📋 Dashboard Tables - Filter state:', filters);
  console.log('📋 Dashboard Tables - API params:', { startDate, endDate, providerId });

  const { data: recentBreaches, isLoading: breachesLoading } = useQuery<RecentBreach[]>({
    queryKey: queryKeys.dashboard.recentBreaches(startDate, endDate, providerId, filters.timeRange.preset),
    queryFn: () => {
      console.log('📋 Fetching recent breaches with params:', { startDate, endDate, providerId });
      return fetchRecentBreaches(10);
    },
    ...defaultQueryOptions,
  });

  const { data: expiringCooldowns, isLoading: cooldownsLoading } = useQuery<ExpiringCooldown[]>({
    queryKey: queryKeys.dashboard.expiringCooldowns(providerId),
    queryFn: () => {
      console.log('⏰ Fetching expiring cooldowns with provider:', providerId);
      return fetchExpiringCooldowns(10);
    },
    ...defaultQueryOptions,
  });

  const handleEndCooldown = (cooldownId: string) => {
    console.log('Ending cooldown:', cooldownId);
  };

  const getContextualTitle = (baseTitle: string) => {
    const context = getDisplayContext();
    return context ? `${baseTitle} ${context}` : baseTitle;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
      {/* Recent Breaches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-base lg:text-lg">
              {getContextualTitle('Recent Breaches')}
            </CardTitle>
            <p className="text-xs lg:text-sm text-muted-foreground">Latest rule violations in selected period</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/admin/breaches')}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {breachesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentBreaches?.slice(0, 5).map((breach) => (
                <div key={breach.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive" className="text-xs">
                        {breach.rule_type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(breach.created_at)}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{breach.rule_name}</p>
                    <p className="text-xs text-gray-600">{breach.market} • {breach.symbol}</p>
                  </div>
                  <Badge 
                    variant={breach.status === 'active' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {breach.status}
                  </Badge>
                </div>
              ))}
              {(!recentBreaches || recentBreaches.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent breaches in selected period</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expiring Cooldowns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-base lg:text-lg">
              {getContextualTitle('Expiring Cooldowns')}
            </CardTitle>
            <p className="text-xs lg:text-sm text-muted-foreground">Active cooling periods</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/admin/cooldowns')}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {cooldownsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {expiringCooldowns?.slice(0, 5).map((cooldown) => (
                <div key={cooldown.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{cooldown.rule_name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {cooldown.market} • {cooldown.symbol}
                    </p>
                    <p className="text-xs text-blue-600">
                      Expires: {new Date(cooldown.expires_at).toLocaleDateString()} at {' '}
                      {new Date(cooldown.expires_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <ComplianceTooltip>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={() => handleEndCooldown(cooldown.id)}
                    >
                      End Now
                    </Button>
                  </ComplianceTooltip>
                </div>
              ))}
              {(!expiringCooldowns || expiringCooldowns.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active cooldowns</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTables;
