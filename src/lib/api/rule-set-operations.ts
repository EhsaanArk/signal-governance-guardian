
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { deleteRuleSet } from './rule-sets';

export async function duplicateRuleSet(id: string, name: string) {
  try {
    // Get the original rule set
    const { data: originalRuleSet, error: fetchError } = await supabase
      .from('rule_sets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Create new rule set with modified name
    const newRuleSetData = {
      name: `${name} (copy)`,
      description: originalRuleSet.description,
      markets: originalRuleSet.markets,
      is_active: originalRuleSet.is_active
    };

    const { data: newRuleSet, error: ruleSetError } = await supabase
      .from('rule_sets')
      .insert(newRuleSetData)
      .select()
      .single();

    if (ruleSetError) throw ruleSetError;

    // Copy sub-rules
    const { data: originalSubRules } = await supabase
      .from('sub_rules')
      .select('*')
      .eq('rule_set_id', id);

    if (originalSubRules && originalSubRules.length > 0) {
      const newSubRules = originalSubRules.map(rule => ({
        rule_set_id: newRuleSet.id,
        rule_type: rule.rule_type,
        is_enabled: rule.is_enabled,
        configuration: rule.configuration
      }));

      const { error: subRulesError } = await supabase
        .from('sub_rules')
        .insert(newSubRules);

      if (subRulesError) throw subRulesError;
    }

    toast.success(`Rule Set "${name}" duplicated successfully`);
    return { success: true };

  } catch (error) {
    console.error('Error duplicating rule set:', error);
    toast.error('Failed to duplicate rule set');
    return { success: false, error };
  }
}

export async function deleteRuleSets(ids: string[], ruleSets: any[]) {
  try {
    // First, check if any of these rule sets have associated breach events
    const { data: breachEvents } = await supabase
      .from('breach_events')
      .select('rule_set_id')
      .in('rule_set_id', ids);

    if (breachEvents && breachEvents.length > 0) {
      const affectedRuleSets = [...new Set(breachEvents.map(b => b.rule_set_id))];
      const ruleSetNames = ruleSets
        .filter(rs => affectedRuleSets.includes(rs.id))
        .map(rs => rs.name)
        .join(', ');

      toast.error(`Cannot delete rule sets (${ruleSetNames}) because they have associated breach events. Delete the breach events first.`);
      return { success: false };
    }

    // If no breach events, proceed with deletion
    for (const id of ids) {
      const { error } = await deleteRuleSet(id);
      if (error) throw error;
    }

    toast.success(`${ids.length} rule set(s) deleted successfully`);
    return { success: true };

  } catch (error) {
    console.error('Error deleting rule sets:', error);
    toast.error('Failed to delete rule sets');
    return { success: false, error };
  }
}
