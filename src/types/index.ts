
import type { Market, RuleSet, BreachEvent, ActiveCooldown } from './database';

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
  selectedPairs?: string[];
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

// Extended rule set interface that includes frontend-specific properties
export interface CompleteRuleSet {
  // Database properties
  id: string;
  name: string;
  description?: string;
  markets: Market[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Frontend-specific computed properties
  enabledRules: {
    coolingOff: boolean;
    sameDirectionGuard: boolean;
    maxActiveTrades: boolean;
    positivePipCancelLimit: boolean;
  };
  breaches24h: number;
  status: boolean; // Maps to is_active from database
  
  // Rule configurations
  coolingOff: CoolingOffRule;
  sameDirectionGuard: SameDirectionGuardRule;
  maxActiveTrades: MaxActiveTradesRule;
  positivePipCancelLimit: PositivePipCancelLimitRule;
}
