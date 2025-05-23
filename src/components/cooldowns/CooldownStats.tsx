
import React from 'react';
import { Timer, AlertOctagon, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoolDownStats } from '@/types';

interface CooldownStatsProps {
  stats: CoolDownStats;
}

const CooldownStats: React.FC<CooldownStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Providers in Cooldown
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.providersInCooldown}</div>
          <p className="text-xs text-muted-foreground">
            Currently restricted providers
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg Remaining Time
          </CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgRemainingTime}</div>
          <p className="text-xs text-muted-foreground">
            Until cooldowns expire
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Top Breached Rule Set
          </CardTitle>
          <AlertOctagon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.topBreachedRuleSet.name}</div>
          <p className="text-xs text-muted-foreground">
            {stats.topBreachedRuleSet.count} breaches today
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CooldownStats;
