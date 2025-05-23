// Re-export database types for backward compatibility
export type { Market, RuleSet, BreachEvent, ActiveCooldown } from './database';

export type RuleStatus = 'On' | 'Off' | 'All';

export interface BreachLog {
  id: string;
  timestamp: string;
  provider: string;
  market: Market;
  ruleSetId: string;
  ruleSetName: string;
  subRule: string;
  action: string;
  details: string;
}

export interface CoolDown {
  id: string;
  provider: string;
  market: Market;
  ruleSetId: string;
  ruleSetName: string;
  startedAt: string;
  endsAt: string;
  remainingTime: string;
}

export interface CoolDownStats {
  providersInCooldown: number;
  avgRemainingTime: string;
  topBreachedRuleSet: {
    name: string;
    count: number;
  };
}

export interface CoolingOffRule {
  enabled: boolean;
  tiers: {
    threshold: number;
    window: number;
    coolOff: number;
  }[];
  metric: 'SLCount' | 'Consecutive';
}

export interface SameDirectionGuardRule {
  enabled: boolean;
  pairScope: 'All' | 'Select';
  directions: {
    long: boolean;
    short: boolean;
  };
}

export interface MaxActiveTradesRule {
  enabled: boolean;
  baseCap: number;
  incrementPerWin: number;
  hardCap: number | null;
  resetPolicy: 'Never' | 'Monthly' | 'OnFirstSL';
}

export interface PositivePipCancelLimitRule {
  enabled: boolean;
  plBand: {
    from: number;
    to: number;
  };
  minHoldTime: number;
  maxCancels: number;
  window: 'UTCDay' | 'Custom';
  suspensionDuration: number;
}

export interface CompleteRuleSet extends RuleSet {
  coolingOff: CoolingOffRule;
  sameDirectionGuard: SameDirectionGuardRule;
  maxActiveTrades: MaxActiveTradesRule;
  positivePipCancelLimit: PositivePipCancelLimitRule;
}
