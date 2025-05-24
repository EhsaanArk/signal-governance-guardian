
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchRecentBreaches, fetchExpiringCooldowns } from '@/lib/api/dashboard';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import MarketChip from '@/components/common/MarketChip';

const DashboardTables = () => {
  const navigate = useNavigate();

  const { data: recentBreaches, isLoading: breachesLoading } = useQuery({
    queryKey: ['dashboard-recent-breaches'],
    queryFn: fetchRecentBreaches,
    refetchInterval: 30000,
  });

  const { data: expiringCooldowns, isLoading: cooldownsLoading } = useQuery({
    queryKey: ['dashboard-expiring-cooldowns'],
    queryFn: fetchExpiringCooldowns,
    refetchInterval: 10000, // More frequent for countdown timers
  });

  const RecentBreachesTable = () => {
    if (breachesLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    if (!recentBreaches?.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-lg font-medium">Clean sheet!</p>
          <p>No breaches in the last 24 hours</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Market</TableHead>
            <TableHead>Rule</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentBreaches.map((breach) => (
            <TableRow 
              key={breach.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/admin/breaches?id=${breach.id}`)}
            >
              <TableCell className="font-mono text-xs">
                {format(new Date(breach.occurred_at), 'HH:mm')}
              </TableCell>
              <TableCell className="font-medium">{breach.providerName}</TableCell>
              <TableCell>
                <MarketChip market={breach.market} />
              </TableCell>
              <TableCell className="truncate max-w-32">{breach.ruleName}</TableCell>
              <TableCell>
                <Badge variant={breach.action_taken === 'signal_rejected' ? 'destructive' : 'secondary'}>
                  {breach.action_taken.replace('_', ' ')}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const ExpiringCooldownsTable = () => {
    if (cooldownsLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    if (!expiringCooldowns?.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No cooldowns expiring soon</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Market</TableHead>
            <TableHead>Ends in</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expiringCooldowns.map((cooldown) => (
            <TableRow key={cooldown.id}>
              <TableCell className="font-medium">{cooldown.providerName}</TableCell>
              <TableCell>
                <MarketChip market={cooldown.market} />
              </TableCell>
              <TableCell className="font-mono">
                {formatDistanceToNow(new Date(cooldown.expires_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/admin/cooldowns?id=${cooldown.id}`)}
                >
                  Manage
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Breaches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Breaches</CardTitle>
            <p className="text-sm text-muted-foreground">Last 10 events</p>
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
          <RecentBreachesTable />
        </CardContent>
      </Card>

      {/* Expiring Cool-downs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Expiring Cool-downs</CardTitle>
            <p className="text-sm text-muted-foreground">Next 10 to expire</p>
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
          <ExpiringCooldownsTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTables;
