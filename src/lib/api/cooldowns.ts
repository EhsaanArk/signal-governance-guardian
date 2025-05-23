
import { supabase } from '@/integrations/supabase/client';
import { ActiveCooldown, Market } from '@/types/database';

export async function fetchActiveCooldowns() {
  console.log('Fetching active cooldowns...');
  
  try {
    // First get the cooldown data
    const { data: cooldownData, error: cooldownError } = await supabase
      .from('active_cooldowns')
      .select('*')
      .eq('status', 'active')
      .order('expires_at', { ascending: true });

    if (cooldownError) {
      console.error('Error fetching active cooldowns:', cooldownError);
      return { data: [], error: cooldownError };
    }

    console.log('Raw cooldown data:', cooldownData);

    if (!cooldownData || cooldownData.length === 0) {
      console.log('No active cooldowns found');
      return { data: [], error: null };
    }

    // Get unique IDs for related data
    const providerIds = [...new Set(cooldownData.map(c => c.provider_id))];
    const ruleSetIds = [...new Set(cooldownData.map(c => c.rule_set_id))];

    console.log('Fetching related data for cooldowns:', { providerIds, ruleSetIds });

    // Fetch providers
    const { data: providers } = await supabase
      .from('signal_providers')
      .select('id, provider_name')
      .in('id', providerIds);

    // Fetch rule sets
    const { data: ruleSets } = await supabase
      .from('rule_sets')
      .select('id, name')
      .in('id', ruleSetIds);

    console.log('Related cooldown data fetched:', { providers, ruleSets });

    // Create lookup maps
    const providerMap = new Map(providers?.map(p => [p.id, p.provider_name]) || []);
    const ruleSetMap = new Map(ruleSets?.map(rs => [rs.id, rs.name]) || []);

    // Transform the data
    const transformedData = cooldownData.map(cooldown => ({
      ...cooldown,
      signal_provider: providerMap.get(cooldown.provider_id) ? {
        provider_name: providerMap.get(cooldown.provider_id)
      } : undefined,
      rule_set: ruleSetMap.get(cooldown.rule_set_id) ? {
        name: ruleSetMap.get(cooldown.rule_set_id)
      } : undefined
    }));

    console.log('Transformed cooldown data:', transformedData);
    return { data: transformedData, error: null };

  } catch (error) {
    console.error('Error in fetchActiveCooldowns:', error);
    return { data: [], error: error as any };
  }
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
