
import { CompleteRuleSet } from '@/types';
import { RuleSet, SubRule } from '@/types/database';

export const transformToCompleteRuleSet = (ruleSet: RuleSet, subRules: SubRule[]): CompleteRuleSet => {
  // Determine enabled rules
  const enabledRules = {
    coolingOff: subRules?.some(rule => rule.rule_type === 'cooling_off') || false,
    sameDirectionGuard: subRules?.some(rule => rule.rule_type === 'same_direction_guard') || false,
    maxActiveTrades: subRules?.some(rule => rule.rule_type === 'max_active_trades') || false,
    positivePipCancelLimit: subRules?.some(rule => rule.rule_type === 'positive_pip_cancel_limit') || false,
  };
  
  // Get rule configurations with proper type casting
  const coolingOffRule = subRules?.find(rule => rule.rule_type === 'cooling_off');
  const sameDirectionRule = subRules?.find(rule => rule.rule_type === 'same_direction_guard');
  const maxActiveRule = subRules?.find(rule => rule.rule_type === 'max_active_trades');
  const positivePipRule = subRules?.find(rule => rule.rule_type === 'positive_pip_cancel_limit');
  
  const completeRuleSet: CompleteRuleSet = {
    id: ruleSet.id,
    name: ruleSet.name,
    description: ruleSet.description,
    markets: ruleSet.markets,
    is_active: ruleSet.is_active,
    created_at: ruleSet.created_at,
    updated_at: ruleSet.updated_at,
    created_by: ruleSet.created_by,
    enabledRules,
    breaches24h: 0, // TODO: Calculate from breach_events table
    status: ruleSet.is_active,
    coolingOff: (coolingOffRule?.configuration as any) || { 
      enabled: false, 
      tiers: [{ threshold: 2, window: 12, coolOff: 24 }], 
      metric: 'SLCount' 
    },
    sameDirectionGuard: (sameDirectionRule?.configuration as any) || { 
      enabled: false, 
      pairScope: 'All', 
      directions: { long: true, short: true } 
    },
    maxActiveTrades: (maxActiveRule?.configuration as any) || { 
      enabled: false, 
      baseCap: 10, 
      incrementPerWin: 1, 
      hardCap: null, 
      resetPolicy: 'Never' 
    },
    positivePipCancelLimit: (positivePipRule?.configuration as any) || { 
      enabled: false, 
      plBand: { from: 0, to: 10 }, 
      minHoldTime: 5, 
      maxCancels: 2, 
      window: 'UTCDay', 
      suspensionDuration: 24 
    }
  };
  
  return completeRuleSet;
};
