
import { supabase } from '@/integrations/supabase/client';

export async function fetchBreachCounts24h() {
  const { data, error } = await supabase
    .from('breach_events')
    .select('rule_set_id')
    .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error fetching breach counts:', error);
    return { data: {}, error };
  }

  // Count breaches by rule set ID
  const breachCounts: Record<string, number> = {};
  data.forEach(breach => {
    breachCounts[breach.rule_set_id] = (breachCounts[breach.rule_set_id] || 0) + 1;
  });

  return { data: breachCounts, error: null };
}
