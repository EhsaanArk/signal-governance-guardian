
import { DateRange } from 'react-day-picker';
import { Market } from '@/types/database';
import { TimeRangePreset } from '@/components/breaches/TimeRangeSelector';

export type RuleType = 'CO' | 'GD' | 'AC' | 'PC';
export type ActionType = 'paused' | 'rejected' | 'suspended';

export interface BreachEventFilters {
  selectedMarket: Market | 'All';
  providerSearch: string;
  selectedRuleSet: string;
  dateRange: DateRange | undefined;
  timeRangePreset?: TimeRangePreset;
  providerId?: string | null;
  providerName?: string | null;
  selectedRuleTypes?: RuleType[];
  selectedActions?: ActionType[];
}

export interface TransformedBreachEvent {
  id: string;
  timestamp: string;
  provider: string;
  market: Market;
  ruleSetId: string;
  ruleSetName: string;
  subRule: string;
  action: string;
  details: string;
  ruleType?: RuleType;
  actionType?: ActionType;
}

export interface RawBreachEvent {
  id: string;
  occurred_at: string;
  provider_id: string;
  market: Market;
  rule_set_id: string;
  sub_rule_id: string;
  action_taken: string;
  details: any;
  rule_type?: string;
  action_type?: string;
}
