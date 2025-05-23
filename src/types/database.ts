
export type Market = 'Forex' | 'Crypto' | 'Indices';

export type RuleType = 'cooling_off' | 'same_direction_guard' | 'max_active_trades' | 'positive_pip_cancel_limit';

export type BreachAction = 'signal_rejected' | 'cooldown_triggered' | 'suspension_applied';

export type CooldownStatus = 'active' | 'ended_manually' | 'expired';

export interface RuleSet {
  id: string;
  name: string;
  description?: string;
  markets: Market[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface SubRule {
  id: string;
  rule_set_id: string;
  rule_type: RuleType;
  is_enabled: boolean;
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SignalProvider {
  id: string;
  provider_name: string;
  email?: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BreachEvent {
  id: string;
  provider_id: string;
  rule_set_id: string;
  sub_rule_id: string;
  market: Market;
  action_taken: BreachAction;
  details: Record<string, any>;
  signal_data: Record<string, any>;
  occurred_at: string;
  // Joined data
  signal_provider?: SignalProvider;
  rule_set?: RuleSet;
  sub_rule?: SubRule;
}

export interface ActiveCooldown {
  id: string;
  provider_id: string;
  market: Market;
  rule_set_id: string;
  sub_rule_id: string;
  started_at: string;
  expires_at: string;
  status: CooldownStatus;
  end_reason?: string;
  ended_by?: string;
  ended_at?: string;
  // Joined data
  signal_provider?: SignalProvider;
  rule_set?: RuleSet;
}
