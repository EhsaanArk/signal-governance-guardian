
import { useState, useEffect } from 'react';
import { fetchRuleSets } from '@/lib/api/rule-sets';
import { fetchBreachCounts24h } from '@/lib/api/breach-counts';
import { supabase } from '@/integrations/supabase/client';
import { CompleteRuleSet } from '@/types';
import { SubRule } from '@/types/database';
import { transformToCompleteRuleSet } from '@/lib/utils/ruleSetTransformer';

export const useRuleSetData = () => {
  const [ruleSets, setRuleSets] = useState<CompleteRuleSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRuleSets = async () => {
    try {
      setIsLoading(true);
      console.log('Loading rule sets from database...');

      const { data: ruleSetData, error } = await fetchRuleSets();

      if (error) {
        console.error('Error fetching rule sets:', error);
        return { success: false, error };
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

      return { success: true, data: completeRuleSets };

    } catch (error) {
      console.error('Error loading rule sets:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
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
    setRuleSets,
    isLoading,
    loadRuleSets
  };
};
