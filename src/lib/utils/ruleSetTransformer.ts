
import { RuleSet, SubRule } from '@/types/database';
import { CompleteRuleSet } from '@/types';

export const transformToCompleteRuleSet = (
  ruleSet: RuleSet, 
  subRules: SubRule[],
  breaches24h: number = 0
): CompleteRuleSet => {
  // Helper function to get rule configuration or default
  const getRuleConfig = (ruleType: string, defaultConfig: any) => {
    const rule = subRules.find(sr => sr.rule_type === ruleType);
    return rule?.configuration || defaultConfig;
  };

  // Helper function to check if rule is enabled
  const isRuleEnabled = (ruleType: string) => {
    const rule = subRules.find(sr => sr.rule_type === ruleType);
    return rule?.is_enabled || false;
  };

  return {
    // Database properties
    id: ruleSet.id,
    name: ruleSet.name,
    description: ruleSet.description,
    markets: ruleSet.markets,
    is_active: ruleSet.is_active,
    created_at: ruleSet.created_at,
    updated_at: ruleSet.updated_at,
    created_by: ruleSet.created_by,
    
    // Frontend-specific computed properties
    enabledRules: {
      coolingOff: isRuleEnabled('cooling_off'),
      sameDirectionGuard: isRuleEnabled('same_direction_guard'),
      maxActiveTrades: isRuleEnabled('max_active_trades'),
      positivePipCancelLimit: isRuleEnabled('positive_pip_cancel_limit'),
    },
    breaches24h,
    status: ruleSet.is_active,
    
    // Rule configurations with defaults
    coolingOff: {
      enabled: isRuleEnabled('cooling_off'),
      ...getRuleConfig('cooling_off', {
        tiers: [{ threshold: 2, window: 12, coolOff: 24 }],
        metric: 'SLCount',
      })
    },
    sameDirectionGuard: {
      enabled: isRuleEnabled('same_direction_guard'),
      ...getRuleConfig('same_direction_guard', {
        pairScope: 'All',
        directions: { long: true, short: true },
      })
    },
    maxActiveTrades: {
      enabled: isRuleEnabled('max_active_trades'),
      ...getRuleConfig('max_active_trades', {
        baseCap: 10,
        incrementPerWin: 1,
        hardCap: null,
        resetPolicy: 'Never',
      })
    },
    positivePipCancelLimit: {
      enabled: isRuleEnabled('positive_pip_cancel_limit'),
      ...getRuleConfig('positive_pip_cancel_limit', {
        plBand: { from: 0, to: 10 },
        minHoldTime: 5,
        maxCancels: 2,
        window: 'UTCDay',
        suspensionDuration: 24,
      })
    },
  };
};
