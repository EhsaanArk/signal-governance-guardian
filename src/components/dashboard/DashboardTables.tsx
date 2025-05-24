
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { useDashboardTables } from '@/hooks/useDashboardTables';
import BreachTablePresentation from './presentation/BreachTablePresentation';
import CooldownTablePresentation from './presentation/CooldownTablePresentation';

const DashboardTables = () => {
  const navigate = useNavigate();
  const { getContextualTitle } = useDashboardContext();
  const { 
    transformedBreaches, 
    transformedCooldowns,
    breachesLoading,
    cooldownsLoading
  } = useDashboardTables();

  const handleEndCooldown = (cooldownId: string) => {
    console.log('Ending cooldown:', cooldownId);
    // TODO: Implement cooldown ending logic
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
          <BreachTablePresentation 
            breaches={transformedBreaches || []}
            loading={breachesLoading}
          />
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
          <CooldownTablePresentation
            cooldowns={transformedCooldowns || []}
            loading={cooldownsLoading}
            onEndCooldown={handleEndCooldown}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTables;
