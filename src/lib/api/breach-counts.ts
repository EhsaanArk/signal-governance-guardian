
import { supabase } from '@/integrations/supabase/client';
import { Market } from '@/types/database';

export async function fetchBreachCounts24h() {
  console.log('Fetching breach counts for last 24 hours...');
  
  const { data, error } = await supabase
    .from('breach_events')
    .select('rule_set_id')
    .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error fetching breach counts:', error);
    return { data: {}, error };
  }

  console.log('Raw breach events for last 24h:', data);

  // Count breaches by rule set ID
  const breachCounts: Record<string, number> = {};
  data?.forEach(breach => {
    breachCounts[breach.rule_set_id] = (breachCounts[breach.rule_set_id] || 0) + 1;
  });

  console.log('Calculated breach counts:', breachCounts);

  return { data: breachCounts, error: null };
}

export async function fetchBreachCountForRuleSet(params: {
  ruleSetId: string;
  startDate?: Date;
  endDate?: Date;
  providerId?: string;
  market?: string;
}) {
  console.log('Fetching breach count for rule set:', params);
  
  let query = supabase
    .from('breach_events')
    .select('id', { count: 'exact' })
    .eq('rule_set_id', params.ruleSetId);

  if (params.startDate) {
    query = query.gte('occurred_at', params.startDate.toISOString());
  }

  if (params.endDate) {
    query = query.lte('occurred_at', params.endDate.toISOString());
  }

  if (params.providerId) {
    query = query.eq('provider_id', params.providerId);
  }

  // Type guard to ensure market is a valid Market type
  if (params.market && params.market !== 'All' && isValidMarket(params.market)) {
    query = query.eq('market', params.market);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error fetching breach count for rule set:', error);
    return { count: 0, error };
  }

  console.log(`Breach count for rule set ${params.ruleSetId}:`, count);
  return { count: count || 0, error: null };
}

// Type guard function to check if a string is a valid Market type
function isValidMarket(market: string): market is Market {
  return ['Forex', 'Crypto', 'Indices'].includes(market);
}
