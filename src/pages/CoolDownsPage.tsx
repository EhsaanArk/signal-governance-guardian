
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import CooldownStats from '@/components/cooldowns/CooldownStats';
import CooldownList from '@/components/cooldowns/CooldownList';

import { supabase } from '@/integrations/supabase/client';
import { endCooldown } from '@/lib/api/cooldowns';
import { toast } from 'sonner';

const CoolDownsPage: React.FC = () => {
  // Fetch active cooldowns from database
  const { data: cooldowns = [], isLoading, refetch } = useQuery({
    queryKey: ['activeCooldowns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_cooldowns')
        .select(`
          id,
          provider_id,
          market,
          started_at,
          expires_at,
          status,
          signal_providers!provider_id(provider_name),
          rule_sets!rule_set_id(id, name)
        `)
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching cooldowns:', error);
        throw error;
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
        if (remainingHours > 24) {
          const days = Math.floor(remainingHours / 24);
          const hours = remainingHours % 24;
          remainingTime = `${days}d ${hours}h`;
        } else if (remainingHours > 0) {
          remainingTime = `${remainingHours}h ${remainingMinutes}m`;
        } else if (remainingMinutes > 0) {
          remainingTime = `${remainingMinutes}m`;
        } else {
          remainingTime = 'Expired';
        }

        return {
          id: cooldown.id,
          provider: cooldown.signal_providers?.provider_name || 'Unknown Provider',
          market: cooldown.market,
          ruleSetId: cooldown.rule_sets?.id || '',
          ruleSetName: cooldown.rule_sets?.name || 'Unknown Rule Set',
          startedAt: cooldown.started_at,
          endsAt: cooldown.expires_at,
          remainingTime
        };
      });
    }
  });

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    const providersInCooldown = cooldowns.length;
    
    // Calculate average remaining time
    const totalRemainingMs = cooldowns.reduce((sum, cooldown) => {
      const now = new Date();
      const expiresAt = new Date(cooldown.endsAt);
      const remaining = Math.max(0, expiresAt.getTime() - now.getTime());
      return sum + remaining;
    }, 0);
    
    const avgRemainingMs = providersInCooldown > 0 ? totalRemainingMs / providersInCooldown : 0;
    const avgHours = Math.floor(avgRemainingMs / (1000 * 60 * 60));
    const avgMinutes = Math.floor((avgRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let avgRemainingTime = '0h 0m';
    if (avgHours > 0) {
      avgRemainingTime = `${avgHours}h ${avgMinutes}m`;
    } else if (avgMinutes > 0) {
      avgRemainingTime = `${avgMinutes}m`;
    }

    // Find most common rule set
    const ruleSetCounts: Record<string, number> = {};
    cooldowns.forEach(cooldown => {
      ruleSetCounts[cooldown.ruleSetName] = (ruleSetCounts[cooldown.ruleSetName] || 0) + 1;
    });
    
    const topRuleSet = Object.entries(ruleSetCounts).reduce(
      (max, [name, count]) => count > max.count ? { name, count } : max,
      { name: 'None', count: 0 }
    );

    return {
      providersInCooldown,
      avgRemainingTime,
      topBreachedRuleSet: topRuleSet
    };
  }, [cooldowns]);
  
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
        <CooldownStats stats={stats} />
        
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
