import { supabase } from '@/integrations/supabase/client';
import { CoolDown, CoolDownStats } from '@/types';

// Test cooldowns table access
export async function testCooldownsConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing cooldowns table connection...');
    const { data, error } = await supabase
      .from('active_cooldowns')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Cooldowns connection test failed:', error);
      return false;
    }
    
    console.log('✅ Cooldowns connection successful. Count:', data);
    return true;
  } catch (error) {
    console.error('❌ Cooldowns connection test exception:', error);
    return false;
  }
}

export async function fetchExpiringCooldowns(limit: number = 10, providerId?: string) {
  console.log('⏰ Fetching expiring cooldowns with filters:', { limit, providerId });
  
  let query = supabase
    .from('active_cooldowns')
    .select(`
      *,
      signal_provider:signal_providers!active_cooldowns_provider_id_fkey(provider_name),
      rule_set:rule_sets!active_cooldowns_rule_set_id_fkey(name)
    `)
    .eq('status', 'active')
    .order('expires_at', { ascending: true })
    .limit(limit);

  // Apply provider filter if provided
  if (providerId) {
    query = query.eq('provider_id', providerId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Error fetching expiring cooldowns:', error);
    throw error;
  }

  console.log('✅ Expiring cooldowns fetched:', data?.length || 0);

  return data?.map(cooldown => ({
    id: cooldown.id,
    rule_name: cooldown.rule_set?.name || 'Unknown Rule',
    market: cooldown.market,
    symbol: 'N/A', // Cooldowns don't have symbol data, use placeholder
    expires_at: cooldown.expires_at
  })) || [];
}

export async function fetchCooldowns(): Promise<CoolDown[]> {
  console.log('🚀 Starting cooldowns fetch...');
  
  // Test connection first
  const connectionOk = await testCooldownsConnection();
  if (!connectionOk) {
    console.error('❌ Cooldowns database connection failed');
    throw new Error('Cooldowns database connection failed');
  }

  try {
    console.log('📊 Fetching active cooldowns with related data...');
    
    const { data, error } = await supabase
      .from('active_cooldowns')
      .select(`
        *,
        signal_provider:signal_providers!active_cooldowns_provider_id_fkey(provider_name),
        rule_set:rule_sets!active_cooldowns_rule_set_id_fkey(name)
      `)
      .eq('status', 'active')
      .order('expires_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching cooldowns:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('✅ Successfully fetched cooldowns');
    console.log('📈 Total active cooldowns found:', data?.length || 0);

    if (!data || data.length === 0) {
      console.log('📭 No active cooldowns found');
      return [];
    }

    console.log('📋 Sample cooldowns:', data.slice(0, 3));

    // Transform the data
    const cooldowns: CoolDown[] = data.map(cooldown => {
      const now = new Date();
      const expiresAt = new Date(cooldown.expires_at);
      const timeRemaining = expiresAt.getTime() - now.getTime();
      
      // Calculate remaining time display
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const remainingTime = timeRemaining > 0 
        ? `${hours}h ${minutes}m`
        : 'Expired';

      return {
        id: cooldown.id,
        provider: cooldown.signal_provider?.provider_name || 'Unknown Provider',
        market: cooldown.market,
        ruleSetId: cooldown.rule_set_id,
        ruleSetName: cooldown.rule_set?.name || 'Unknown Rule Set',
        startedAt: cooldown.started_at,
        endsAt: cooldown.expires_at,
        remainingTime
      };
    });

    console.log('🎯 Cooldowns transformation complete:', cooldowns.length);
    return cooldowns;

  } catch (error) {
    console.error('💥 Exception during cooldowns fetch:', error);
    throw error;
  }
}

export async function fetchCooldownStats(): Promise<CoolDownStats> {
  console.log('📊 Fetching cooldown statistics...');
  
  try {
    const cooldowns = await fetchCooldowns();
    
    if (cooldowns.length === 0) {
      console.log('📭 No cooldowns for stats calculation');
      return {
        providersInCooldown: 0,
        avgRemainingTime: '0h 0m',
        topBreachedRuleSet: {
          name: 'None',
          count: 0
        }
      };
    }

    // Calculate providers in cooldown
    const uniqueProviders = new Set(cooldowns.map(c => c.provider));
    const providersInCooldown = uniqueProviders.size;

    // Calculate average remaining time
    const totalMinutes = cooldowns.reduce((sum, cooldown) => {
      const now = new Date();
      const expiresAt = new Date(cooldown.endsAt);
      const remainingMs = Math.max(0, expiresAt.getTime() - now.getTime());
      return sum + (remainingMs / (1000 * 60)); // Convert to minutes
    }, 0);

    const avgMinutes = Math.floor(totalMinutes / cooldowns.length);
    const avgHours = Math.floor(avgMinutes / 60);
    const avgRemainingMinutes = avgMinutes % 60;
    const avgRemainingTime = `${avgHours}h ${avgRemainingMinutes}m`;

    // Find most breached rule set
    const ruleSetCounts = cooldowns.reduce((acc, cooldown) => {
      acc[cooldown.ruleSetName] = (acc[cooldown.ruleSetName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEntry = Object.entries(ruleSetCounts).reduce((max, [name, count]) => 
      count > max.count ? { name, count } : max
    , { name: 'None', count: 0 });

    const stats = {
      providersInCooldown,
      avgRemainingTime,
      topBreachedRuleSet: topEntry
    };

    console.log('✅ Cooldown stats calculated:', stats);
    return stats;

  } catch (error) {
    console.error('💥 Exception during cooldown stats fetch:', error);
    throw error;
  }
}
