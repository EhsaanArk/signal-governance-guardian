
import { DateRange } from 'react-day-picker';
import { Market } from '@/types/database';

export interface BreachEventFilters {
  selectedMarket: Market | 'All';
  providerSearch: string;
  selectedRuleSet: string;
  dateRange: DateRange | undefined;
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
}
