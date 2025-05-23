
import { supabase } from '@/integrations/supabase/client';
import { BreachEvent, Market } from '@/types/database';
import { DateRange } from 'react-day-picker';

export interface BreachEventFilters {
  market?: Market | 'All';
  provider_search?: string;
  rule_set_id?: string;
  date_range?: DateRange;
}

export async function fetchBreachEvents(filters: BreachEventFilters = {}) {
  let query = supabase
    .from('breach_events')
    .select(`
      *,
      signal_provider:signal_providers(provider_name),
      rule_set:rule_sets(name),
      sub_rule:sub_rules(rule_type)
    `)
    .order('occurred_at', { ascending: false });

  // Apply filters
  if (filters.market && filters.market !== 'All') {
    query = query.eq('market', filters.market);
  }

  if (filters.provider_search) {
    // We'll need to join with signal_providers to search by name
    const { data: providers } = await supabase
      .from('signal_providers')
      .select('id')
      .ilike('provider_name', `%${filters.provider_search}%`);
    
    if (providers && providers.length > 0) {
      const providerIds = providers.map(p => p.id);
      query = query.in('provider_id', providerIds);
    } else {
      // No matching providers, return empty result
      return { data: [], error: null };
    }
  }

  if (filters.rule_set_id && filters.rule_set_id !== 'all') {
    query = query.eq('rule_set_id', filters.rule_set_id);
  }

  if (filters.date_range?.from) {
    query = query.gte('occurred_at', filters.date_range.from.toISOString());
  }

  if (filters.date_range?.to) {
    query = query.lte('occurred_at', filters.date_range.to.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching breach events:', error);
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
