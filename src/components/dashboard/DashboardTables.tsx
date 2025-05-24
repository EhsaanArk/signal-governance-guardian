
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { fetchRecentBreaches, fetchExpiringCooldowns } from '@/lib/api/dashboard';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import MarketChip from '@/components/common/MarketChip';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardTables = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedCooldownId, setSelectedCooldownId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [endReason, setEndReason] = React.useState('');

  const { data: recentBreaches, isLoading: breachesLoading } = useQuery({
    queryKey: ['dashboard-recent-breaches'],
    queryFn: fetchRecentBreaches,
    refetchInterval: 30000,
  });

  const { data: expiringCooldowns, isLoading: cooldownsLoading } = useQuery({
    queryKey: ['dashboard-expiring-cooldowns'],
    queryFn: fetchExpiringCooldowns,
    refetchInterval: 10000,
  });

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'cooldown':
      case 'cool_down':
        return 'secondary';
      case 'signal_rejected':
      case 'rejected':
        return 'destructive';
      case 'suspension':
      case 'suspended':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'cooldown':
      case 'cool_down':
        return 'bg-gray-500 text-white hover:bg-gray-600';
      case 'signal_rejected':
      case 'rejected':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'suspension':
      case 'suspended':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  const handleEndNowClick = (cooldownId: string) => {
    setSelectedCooldownId(cooldownId);
    setDialogOpen(true);
  };

  const handleConfirmEnd = () => {
    if (selectedCooldownId && endReason) {
      // In a real app, you'd call an API to end the cooldown
      console.log('Ending cooldown:', selectedCooldownId, 'Reason:', endReason);
      setDialogOpen(false);
      setEndReason('');
      setSelectedCooldownId(null);
    }
  };

  const LoadingSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );

  const EmptyState = ({ 
    icon: Icon, 
    title, 
    description 
  }: { 
    icon: React.ComponentType<any>; 
    title: string; 
    description: string; 
  }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );

  const RecentBreachesTable = () => {
    if (breachesLoading) {
      return <LoadingSkeleton />;
    }

    if (!recentBreaches?.length) {
      return (
        <EmptyState
          icon={() => <div className="text-6xl">🎉</div>}
          title="Clean Sheet!"
          description="No breaches detected in the last 24 hours. System operating smoothly."
        />
      );
    }

    if (isMobile) {
      return (
        <div className="space-y-3">
          {recentBreaches.map((breach) => (
            <div 
              key={breach.id}
              className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/admin/breaches?id=${breach.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {format(new Date(breach.occurred_at), 'HH:mm')}
                  </span>
                  <MarketChip market={breach.market} />
                </div>
                <Badge 
                  variant={getActionBadgeVariant(breach.action_taken)}
                  className={getActionBadgeColor(breach.action_taken)}
                >
                  {breach.action_taken.replace('_', ' ')}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">{breach.providerName}</p>
                <p className="text-xs text-muted-foreground truncate">{breach.ruleName}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <ScrollArea className="w-full">
        <div className="min-w-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Time</TableHead>
                <TableHead className="min-w-[120px]">Provider</TableHead>
                <TableHead className="w-24">Market</TableHead>
                <TableHead className="min-w-[160px]">Rule</TableHead>
                <TableHead className="w-28">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBreaches.map((breach) => (
                <TableRow 
                  key={breach.id}
                  className="cursor-pointer hover:bg-muted/50 group"
                  onClick={() => navigate(`/admin/breaches?id=${breach.id}`)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {format(new Date(breach.occurred_at), 'HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {breach.providerName}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <MarketChip market={breach.market} />
                  </TableCell>
                  <TableCell>
                    <div className="truncate max-w-[200px]" title={breach.ruleName}>
                      {breach.ruleName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getActionBadgeVariant(breach.action_taken)}
                      className={`text-xs ${getActionBadgeColor(breach.action_taken)}`}
                    >
                      {breach.action_taken.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    );
  };

  const ExpiringCooldownsTable = () => {
    if (cooldownsLoading) {
      return <LoadingSkeleton />;
    }

    if (!expiringCooldowns?.length) {
      return (
        <EmptyState
          icon={Clock}
          title="No Expiring Cooldowns"
          description="All provider cooldowns are either stable or have sufficient time remaining."
        />
      );
    }

    if (isMobile) {
      return (
        <div className="space-y-3">
          {expiringCooldowns.map((cooldown) => (
            <div key={cooldown.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{cooldown.providerName}</span>
                  <MarketChip market={cooldown.market} />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEndNowClick(cooldown.id)}
                >
                  End now
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono text-muted-foreground">
                  {formatDistanceToNow(new Date(cooldown.expires_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <ScrollArea className="w-full">
        <div className="min-w-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Provider</TableHead>
                <TableHead className="w-24">Market</TableHead>
                <TableHead className="min-w-[140px]">Expires In</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiringCooldowns.map((cooldown) => (
                <TableRow key={cooldown.id} className="group">
                  <TableCell className="font-medium">{cooldown.providerName}</TableCell>
                  <TableCell>
                    <MarketChip market={cooldown.market} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-sm">
                        {formatDistanceToNow(new Date(cooldown.expires_at), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8"
                      onClick={() => handleEndNowClick(cooldown.id)}
                    >
                      End now
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Breaches */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Recent Breaches
              </CardTitle>
              <p className="text-sm text-muted-foreground">Last 10 breach events</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="shrink-0"
              onClick={() => navigate('/admin/breaches')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            <RecentBreachesTable />
          </CardContent>
        </Card>

        {/* Expiring Cool-downs */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Expiring Cool-downs
              </CardTitle>
              <p className="text-sm text-muted-foreground">Next 10 to expire</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="shrink-0"
              onClick={() => navigate('/admin/cooldowns')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            <ExpiringCooldownsTable />
          </CardContent>
        </Card>
      </div>

      {/* End Cooldown Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Cooldown Early</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to end this cooldown before its scheduled expiration.
              Please provide a reason for this override.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <Select onValueChange={(value) => setEndReason(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false_positive">False positive</SelectItem>
                <SelectItem value="client_request">Client request</SelectItem>
                <SelectItem value="rule_misconfiguration">Rule misconfiguration</SelectItem>
                <SelectItem value="testing">Testing or simulation</SelectItem>
                <SelectItem value="other">Other (specify)</SelectItem>
              </SelectContent>
            </Select>
            
            {endReason === 'other' && (
              <Textarea 
                placeholder="Specify the reason..." 
                onChange={(e) => setEndReason(e.target.value)}
                className="min-h-[100px]"
              />
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEnd} disabled={!endReason}>
              End Cooldown
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DashboardTables;
