
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import CooldownStats from '@/components/cooldowns/CooldownStats';
import CooldownList from '@/components/cooldowns/CooldownList';

import { supabase } from '@/integrations/supabase/client';
import { endCooldown } from '@/lib/api/breach-events';
import { toast } from 'sonner';

const CoolDownsPage: React.FC = () => {
  // Fetch active cooldowns with simplified approach and debugging
  const { data: cooldowns = [], isLoading, refetch } = useQuery({
    queryKey: ['activeCooldowns'],
    queryFn: async () => {
      console.log('=== FETCHING ACTIVE COOLDOWNS - SIMPLIFIED APPROACH ===');
      
      try {
        // Step 1: Fetch ALL cooldowns first to see what's in the database
        console.log('Step 1: Fetching ALL cooldowns...');
        const { data: allCooldowns, error: allCooldownsError } = await supabase
          .from('active_cooldowns')
          .select('*')
          .order('expires_at', { ascending: true });

        if (allCooldownsError) {
          console.error('Error fetching all cooldowns:', allCooldownsError);
          throw allCooldownsError;
        }

        console.log('All cooldowns in database:', allCooldowns);
        console.log('Total cooldowns found:', allCooldowns?.length || 0);

        if (!allCooldowns || allCooldowns.length === 0) {
          console.log('No cooldowns exist in the database at all');
          return [];
        }

        // Step 2: Filter for active cooldowns
        const activeCooldowns = allCooldowns.filter(cooldown => cooldown.status === 'active');
        console.log('Active cooldowns:', activeCooldowns);
        console.log('Active cooldowns count:', activeCooldowns.length);

        if (activeCooldowns.length === 0) {
          console.log('No active cooldowns found');
          return [];
        }

        // Step 3: Fetch related data
        const providerIds = [...new Set(activeCooldowns.map(c => c.provider_id))];
        const ruleSetIds = [...new Set(activeCooldowns.map(c => c.rule_set_id))];

        console.log('Fetching related data for cooldowns:', { 
          providerIds: providerIds.length, 
          ruleSetIds: ruleSetIds.length 
        });

        // Fetch providers and rule sets
        const [
          { data: providers, error: providersError },
          { data: ruleSets, error: ruleSetsError }
        ] = await Promise.all([
          supabase
            .from('signal_providers')
            .select('id, provider_name')
            .in('id', providerIds),
          supabase
            .from('rule_sets')
            .select('id, name')
            .in('id', ruleSetIds)
        ]);

        if (providersError) console.error('Error fetching providers for cooldowns:', providersError);
        if (ruleSetsError) console.error('Error fetching rule sets for cooldowns:', ruleSetsError);

        console.log('Related cooldown data fetched:', { 
          providers: providers?.length || 0, 
          ruleSets: ruleSets?.length || 0 
        });

        // Create lookup maps
        const providerMap = new Map(providers?.map(p => [p.id, p.provider_name]) || []);
        const ruleSetMap = new Map(ruleSets?.map(rs => [rs.id, rs.name]) || []);

        // Step 4: Transform the data
        const transformedData = activeCooldowns.map(cooldown => {
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

          const providerName = providerMap.get(cooldown.provider_id) || 'Unknown Provider';
          const ruleSetName = ruleSetMap.get(cooldown.rule_set_id) || 'Unknown Rule Set';

          return {
            id: cooldown.id,
            provider: providerName,
            market: cooldown.market,
            ruleSetId: cooldown.rule_set_id,
            ruleSetName: ruleSetName,
            startedAt: cooldown.started_at,
            endsAt: cooldown.expires_at,
            remainingTime
          };
        });

        console.log('Final transformed cooldown data:', transformedData);
        return transformedData;

      } catch (error) {
        console.error('Error in cooldowns query:', error);
        toast.error('Failed to fetch cooldowns');
        return [];
      }
    }
  });

  // Fetch cooldown stats using simple approach
  const { data: stats } = useQuery({
    queryKey: ['cooldownStats'],
    queryFn: async () => {
      console.log('Fetching cooldown stats...');
      
      try {
        // Get count of providers in cooldown
        const { data: cooldownData, error: cooldownError } = await supabase
          .from('active_cooldowns')
          .select('provider_id')
          .eq('status', 'active');

        if (cooldownError) {
          console.error('Error fetching cooldown stats:', cooldownError);
          return {
            providersInCooldown: 0,
            avgRemainingTime: '0h 0m',
            topBreachedRuleSet: { name: 'N/A', count: 0 }
          };
        }

        const providersInCooldown = new Set(cooldownData?.map(c => c.provider_id) || []).size;

        // Get most breached rule set in last 24h
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const { data: breachData } = await supabase
          .from('breach_events')
          .select('rule_set_id')
          .gte('occurred_at', yesterday.toISOString());

        console.log('Breach data for stats:', breachData);

        // Get rule set names for the breach data
        const ruleSetIds = [...new Set(breachData?.map(b => b.rule_set_id) || [])];
        const { data: ruleSets } = await supabase
          .from('rule_sets')
          .select('id, name')
          .in('id', ruleSetIds);

        const ruleSetMap = new Map(ruleSets?.map(rs => [rs.id, rs.name]) || []);

        const ruleSetCounts: Record<string, { name: string; count: number }> = {};
        breachData?.forEach(breach => {
          const ruleSetName = ruleSetMap.get(breach.rule_set_id) || 'Unknown';
          if (!ruleSetCounts[ruleSetName]) {
            ruleSetCounts[ruleSetName] = { name: ruleSetName, count: 0 };
          }
          ruleSetCounts[ruleSetName].count++;
        });

        const topBreachedRuleSet = Object.values(ruleSetCounts)
          .sort((a, b) => b.count - a.count)[0] || { name: 'N/A', count: 0 };

        console.log('Cooldown stats calculated:', {
          providersInCooldown,
          topBreachedRuleSet
        });

        return {
          providersInCooldown,
          avgRemainingTime: '2h 15m', // Placeholder calculation
          topBreachedRuleSet
        };

      } catch (error) {
        console.error('Error calculating cooldown stats:', error);
        return {
          providersInCooldown: 0,
          avgRemainingTime: '0h 0m',
          topBreachedRuleSet: { name: 'N/A', count: 0 }
        };
      }
    }
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
