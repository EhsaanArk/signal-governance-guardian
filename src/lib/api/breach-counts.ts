
import { supabase } from '@/integrations/supabase/client';

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
