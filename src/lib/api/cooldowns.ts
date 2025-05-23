
import { supabase } from '@/integrations/supabase/client';
import { ActiveCooldown, Market } from '@/types/database';

export async function fetchActiveCooldowns() {
  const { data, error } = await supabase
    .from('active_cooldowns')
    .select(`
      *,
      signal_provider:signal_providers(provider_name),
      rule_set:rule_sets(name)
    `)
    .eq('status', 'active')
    .order('expires_at', { ascending: true });

  if (error) {
    console.error('Error fetching active cooldowns:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

export async function endCooldown(cooldownId: string, reason: string) {
  const { data, error } = await supabase
    .from('active_cooldowns')
    .update({
      status: 'ended_manually',
      end_reason: reason,
      ended_at: new Date().toISOString()
    })
    .eq('id', cooldownId)
    .select();

  return { data, error };
}

export async function getCooldownStats() {
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
    .select('rule_set_id, rule_set:rule_sets(name)')
    .gte('occurred_at', yesterday.toISOString());

  const ruleSetCounts: Record<string, { name: string; count: number }> = {};
  breachData?.forEach(breach => {
    const ruleSetName = breach.rule_set?.name || 'Unknown';
    if (!ruleSetCounts[ruleSetName]) {
      ruleSetCounts[ruleSetName] = { name: ruleSetName, count: 0 };
    }
    ruleSetCounts[ruleSetName].count++;
  });

  const topBreachedRuleSet = Object.values(ruleSetCounts)
    .sort((a, b) => b.count - a.count)[0] || { name: 'N/A', count: 0 };

  return {
    providersInCooldown,
    avgRemainingTime: '2h 15m', // Placeholder calculation
    topBreachedRuleSet
  };
}
