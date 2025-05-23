
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import CooldownStats from '@/components/cooldowns/CooldownStats';
import CooldownList from '@/components/cooldowns/CooldownList';

import { fetchActiveCooldowns, getCooldownStats } from '@/lib/api/cooldowns';
import { endCooldown } from '@/lib/api/cooldowns';
import { toast } from 'sonner';

const CoolDownsPage: React.FC = () => {
  // Fetch active cooldowns using the working API function
  const { data: cooldowns = [], isLoading, refetch } = useQuery({
    queryKey: ['activeCooldowns'],
    queryFn: async () => {
      console.log('Fetching cooldowns via API...');
      const { data, error } = await fetchActiveCooldowns();
      
      if (error) {
        console.error('Error fetching cooldowns:', error);
        throw error;
      }

      console.log('Cooldowns data received:', data);

      if (!data || data.length === 0) {
        console.log('No active cooldowns found');
        return [];
      }

      // Transform data to match component expectations
      return data.map(cooldown => {
        const now = new Date();
        const expiresAt = new Date(cooldown.expires_at);
        const remainingMs = expiresAt.getTime() - now.getTime();
        
        // Calculate remaining time
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let remainingTime = '';
        if (remainingMs <= 0) {
          remainingTime = 'Expired';
        } else if (remainingHours > 24) {
          const days = Math.floor(remainingHours / 24);
          const hours = remainingHours % 24;
          remainingTime = `${days}d ${hours}h`;
        } else if (remainingHours > 0) {
          remainingTime = `${remainingHours}h ${remainingMinutes}m`;
        } else if (remainingMinutes > 0) {
          remainingTime = `${remainingMinutes}m`;
        } else {
          remainingTime = 'Less than 1m';
        }

        return {
          id: cooldown.id,
          provider: cooldown.signal_provider?.provider_name || 'Unknown Provider',
          market: cooldown.market,
          ruleSetId: cooldown.rule_set?.id || '',
          ruleSetName: cooldown.rule_set?.name || 'Unknown Rule Set',
          startedAt: cooldown.started_at,
          endsAt: cooldown.expires_at,
          remainingTime
        };
      });
    }
  });

  // Fetch cooldown stats using the API function
  const { data: stats } = useQuery({
    queryKey: ['cooldownStats'],
    queryFn: getCooldownStats
  });

  // Default stats if API call fails
  const defaultStats = {
    providersInCooldown: cooldowns.length,
    avgRemainingTime: '0h 0m',
    topBreachedRuleSet: { name: 'N/A', count: 0 }
  };
  
  const handleEndCooldown = async (id: string, reason: string) => {
    try {
      const { error } = await endCooldown(id, reason);
      if (error) {
        toast.error('Failed to end cooldown');
        console.error('Error ending cooldown:', error);
      } else {
        toast.success(`Cool-down ended for reason: ${reason}`);
        refetch(); // Refresh the data
      }
    } catch (error) {
      toast.error('Failed to end cooldown');
      console.error('Error ending cooldown:', error);
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <Header title="Signal Governance – Active Cool-downs" />
        <div className="p-6">
          <div className="text-center">Loading active cooldowns...</div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <Header title="Signal Governance – Active Cool-downs" />
      
      <div className="p-6 space-y-6">
        <CooldownStats stats={stats || defaultStats} />
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/20 px-4 py-3 border-b">
            <h2 className="text-lg font-medium">Active Cool-downs</h2>
          </div>
          <div className="p-4">
            <CooldownList 
              cooldowns={cooldowns}
              onEndCooldown={handleEndCooldown}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CoolDownsPage;
