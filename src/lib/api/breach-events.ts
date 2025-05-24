import { supabase } from '@/integrations/supabase/client';

export async function fetchRecentBreaches(
  limit: number = 10,
  startDate?: string,
  endDate?: string,
  providerId?: string
) {
  console.log('📋 Fetching recent breaches with filters:', { limit, startDate, endDate, providerId });
  
  let query = supabase
    .from('breach_events')
    .select(`
      *,
      signal_provider:signal_providers!breach_events_provider_id_fkey(provider_name),
      rule_set:rule_sets!breach_events_rule_set_id_fkey(name),
      sub_rule:sub_rules!breach_events_sub_rule_id_fkey(rule_type)
    `)
    .order('occurred_at', { ascending: false })
    .limit(limit);

  // Apply date filters if provided
  if (startDate) {
    query = query.gte('occurred_at', startDate);
  }
  if (endDate) {
    query = query.lte('occurred_at', endDate);
  }
  
  // Apply provider filter if provided
  if (providerId) {
    query = query.eq('provider_id', providerId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Error fetching recent breaches:', error);
    throw error;
  }

  console.log('✅ Recent breaches fetched:', data?.length || 0);

  return data?.map(breach => {
    // Safely extract symbol from signal_data Json field
    const signalData = breach.signal_data as any;
    const symbol = (signalData && typeof signalData === 'object' && signalData.symbol) 
      ? String(signalData.symbol) 
      : 'Unknown';

    return {
      id: breach.id,
      rule_name: breach.rule_set?.name || 'Unknown Rule',
      rule_type: breach.sub_rule?.rule_type || 'Unknown',
      market: breach.market,
      symbol: symbol,
      status: breach.action_taken === 'cooldown_triggered' ? 'active' : 'resolved',
      created_at: breach.occurred_at
    };
  }) || [];
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
