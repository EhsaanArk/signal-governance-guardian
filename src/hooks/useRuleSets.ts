
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchRuleSets, updateRuleSet, deleteRuleSet } from '@/lib/api/rule-sets';
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
      
      // Transform rule sets with sub-rules
      const ruleSetPromises = ruleSetData.map(async (ruleSet) => {
        const { data: subRulesData } = await supabase
          .from('sub_rules')
          .select('*')
          .eq('rule_set_id', ruleSet.id)
          .eq('is_enabled', true);
        
        console.log(`Sub-rules for ${ruleSet.name}:`, subRulesData);
        
        // Transform the data to match our SubRule interface
        const subRules: SubRule[] = (subRulesData || []).map(rule => ({
          ...rule,
          configuration: rule.configuration as Record<string, any>
        }));
        
        return transformToCompleteRuleSet(ruleSet, subRules);
      });
      
      const completeRuleSets = await Promise.all(ruleSetPromises);
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
  
  // Load rule sets on mount
  useEffect(() => {
    loadRuleSets();
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
