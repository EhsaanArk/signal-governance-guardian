
export interface ApiParams {
  startDate?: string;
  endDate?: string;
  providerId?: string;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface DashboardMetrics {
  activeCooldowns: number;
  breaches: number;
  winRate: number;
  providersInReview: number;
  cooldownChange: number;
  breachChange: number;
  winRateChange: number;
  reviewChange: number;
}

export interface RecentBreach {
  id: string;
  rule_name: string;
  rule_type: string;
  market: string;
  symbol: string;
  status: string;
  created_at: string;
  provider_name?: string; // Added optional provider_name field
}

export interface ExpiringCooldown {
  id: string;
  rule_name: string;
  market: string;
  symbol: string;
  expires_at: string;
  provider_name?: string; // Added optional provider_name field
}

export interface HeatmapData {
  markets: {
    [market: string]: {
      [hour: number]: number;
    };
  };
  sessions: TradingSession[];
  totalsByMarket: { [market: string]: number };
  totalsBySessions: { [sessionName: string]: number };
  grandTotal: number;
}

export interface TradingSession {
  name: string;
  startHour: number;
  endHour: number;
  count: number;
}

export interface TopBreachedRule {
  ruleSetId: string;
  name: string;
  count: number;
  percentage: number;
  previousCount: number;
  deltaPercentage: number;
  trendDirection: 'up' | 'down' | 'flat';
}
