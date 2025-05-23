
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchRuleSets, updateRuleSet, deleteRuleSet } from '@/lib/api/rule-sets';
import { fetchBreachCounts24h } from '@/lib/api/breach-counts';
import { supabase } from '@/integrations/supabase/client';
import { CompleteRuleSet } from '@/types';
import { SubRule } from '@/types/database';
import { transformToCompleteRuleSet } from '@/lib/utils/ruleSetTransformer';

export const useRuleSets = () => {
  const [ruleSets, setRuleSets] = useState<CompleteRuleSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadRuleSets = async () => {
    try {
      setIsLoading(true);
      console.log('Loading rule sets from database...');
      
      const { data: ruleSetData, error } = await fetchRuleSets();
      
      if (error) {
        console.error('Error fetching rule sets:', error);
        toast.error('Failed to load rule sets');
        return;
      }
      
      console.log('Fetched rule sets:', ruleSetData);
      
      // Fetch breach counts for the last 24 hours
      const { data: breachCounts } = await fetchBreachCounts24h();
      console.log('Breach counts 24h:', breachCounts);
      
      // Transform rule sets with sub-rules and breach counts
      const ruleSetPromises = ruleSetData.map(async (ruleSet) => {
        console.log(`Fetching sub-rules for rule set: ${ruleSet.name}`);
        
        const { data: subRulesData, error: subRulesError } = await supabase
          .from('sub_rules')
          .select('*')
          .eq('rule_set_id', ruleSet.id);
        
        if (subRulesError) {
          console.error(`Error fetching sub-rules for ${ruleSet.name}:`, subRulesError);
          return null;
        }
        
        console.log(`Sub-rules for ${ruleSet.name}:`, subRulesData);
        
        // Transform the data to match our SubRule interface
        const subRules: SubRule[] = (subRulesData || []).map(rule => ({
          ...rule,
          configuration: rule.configuration as Record<string, any>
        }));
        
        // Get breach count for this rule set
        const breaches24h = breachCounts?.[ruleSet.id] || 0;
        
        return transformToCompleteRuleSet(ruleSet, subRules, breaches24h);
      });
      
      const completeRuleSets = (await Promise.all(ruleSetPromises)).filter(Boolean) as CompleteRuleSet[];
      console.log('Complete rule sets:', completeRuleSets);
      setRuleSets(completeRuleSets);
      
    } catch (error) {
      console.error('Error loading rule sets:', error);
      toast.error('Failed to load rule sets');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDuplicate = async (id: string) => {
    const ruleSetToDuplicate = ruleSets.find(rs => rs.id === id);
    
    if (ruleSetToDuplicate) {
      try {
        // Create new rule set with modified name
        const newRuleSetData = {
          name: `${ruleSetToDuplicate.name} (copy)`,
          description: ruleSetToDuplicate.description,
          markets: ruleSetToDuplicate.markets,
          is_active: ruleSetToDuplicate.is_active
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
        
        toast.success(`Rule Set "${ruleSetToDuplicate.name}" duplicated successfully`);
        loadRuleSets(); // Reload the list
        
      } catch (error) {
        console.error('Error duplicating rule set:', error);
        toast.error('Failed to duplicate rule set');
      }
    }
  };
  
  const handleDelete = async (ids: string[]) => {
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
        return;
      }
      
      // If no breach events, proceed with deletion
      for (const id of ids) {
        const { error } = await deleteRuleSet(id);
        if (error) throw error;
      }
      
      toast.success(`${ids.length} rule set(s) deleted successfully`);
      loadRuleSets(); // Reload the list
      
    } catch (error) {
      console.error('Error deleting rule sets:', error);
      toast.error('Failed to delete rule sets');
    }
  };
  
  const handleStatusChange = async (id: string, enabled: boolean) => {
    try {
      const { error } = await updateRuleSet(id, { is_active: enabled });
      
      if (error) throw error;
      
      // Update local state
      setRuleSets(prev => 
        prev.map(rs => 
          rs.id === id 
            ? { ...rs, status: enabled, is_active: enabled, updated_at: new Date().toISOString() } 
            : rs
        )
      );
      
    } catch (error) {
      console.error('Error updating rule set status:', error);
      toast.error('Failed to update rule set status');
    }
  };
  
  // Load rule sets on mount and set up real-time updates
  useEffect(() => {
    loadRuleSets();
    
    // Set up real-time subscription for rule sets changes
    const ruleSetChannel = supabase
      .channel('rule-sets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rule_sets'
        },
        () => {
          console.log('Rule set changed, refreshing...');
          loadRuleSets();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sub_rules'
        },
        () => {
          console.log('Sub rule changed, refreshing...');
          loadRuleSets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ruleSetChannel);
    };
  }, []);
  
  return {
    ruleSets,
    isLoading,
    loadRuleSets,
    handleDuplicate,
    handleDelete,
    handleStatusChange
  };
};
