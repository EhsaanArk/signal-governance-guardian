
import { supabase } from '@/integrations/supabase/client';
import { RuleSet } from '@/types/database';

export async function fetchRuleSets() {
  const { data, error } = await supabase
    .from('rule_sets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rule sets:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

export async function createRuleSet(ruleSet: Omit<RuleSet, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('rule_sets')
    .insert(ruleSet)
    .select()
    .single();

  return { data, error };
}

export async function updateRuleSet(id: string, updates: Partial<RuleSet>) {
  const { data, error } = await supabase
    .from('rule_sets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteRuleSet(id: string) {
  const { data, error } = await supabase
    .from('rule_sets')
    .delete()
    .eq('id', id);

  return { data, error };
}
