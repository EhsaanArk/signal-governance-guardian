
import { supabase } from '@/integrations/supabase/client';

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
