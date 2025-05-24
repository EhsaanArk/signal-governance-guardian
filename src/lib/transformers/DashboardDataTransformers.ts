
import { DashboardMetrics, HeatmapData, TopBreachedRule, RecentBreach, ExpiringCooldown } from '@/lib/api/types';
import { KPICard } from '@/lib/services/KPIMetricsService';
import { FilterContext } from '@/lib/services/DashboardFiltersService';

export interface TransformedHeatmapData {
  markets: string[];
  sessions: Array<{
    name: string;
    startHour: number;
    endHour: number;
    count: number;
    intensity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  }>;
  marketTotals: { [market: string]: number };
  grandTotal: number;
}

export interface TransformedBreachData {
  id: string;
  timestamp: string;
  timeAgo: string;
  provider: string;
  market: string;
  symbol: string;
  ruleType: string;
  ruleName: string;
  status: 'active' | 'resolved';
  severity: 'low' | 'medium' | 'high';
}

export interface TransformedCooldownData {
  id: string;
  provider: string;
  market: string;
  symbol: string;
  ruleName: string;
  expiresAt: string;
  timeRemaining: string;
  canEndEarly: boolean;
}

export class DashboardDataTransformers {
  static transformHeatmapData(data: HeatmapData): TransformedHeatmapData {
    const getIntensity = (count: number): 'none' | 'low' | 'medium' | 'high' | 'critical' => {
      if (count === 0) return 'none';
      if (count <= 2) return 'low';
      if (count <= 5) return 'medium';
      if (count <= 10) return 'high';
      return 'critical';
    };

    const transformedSessions = data.sessions.map(session => ({
      ...session,
      intensity: getIntensity(session.count)
    }));

    return {
      markets: Object.keys(data.markets),
      sessions: transformedSessions,
      marketTotals: data.totalsByMarket,
      grandTotal: data.grandTotal
    };
  }

  static transformBreachData(breaches: RecentBreach[]): TransformedBreachData[] {
    return breaches.map(breach => ({
      id: breach.id,
      timestamp: breach.created_at,
      timeAgo: this.formatTimeAgo(breach.created_at),
      provider: breach.provider_name || 'Unknown Provider',
      market: breach.market,
      symbol: breach.symbol,
      ruleType: breach.rule_type,
      ruleName: breach.rule_name,
      status: breach.status as 'active' | 'resolved',
      severity: this.calculateBreachSeverity(breach.rule_type)
    }));
  }

  static transformCooldownData(cooldowns: ExpiringCooldown[]): TransformedCooldownData[] {
    return cooldowns.map(cooldown => ({
      id: cooldown.id,
      provider: cooldown.provider_name || 'Unknown Provider',
      market: cooldown.market,
      symbol: cooldown.symbol,
      ruleName: cooldown.rule_name,
      expiresAt: cooldown.expires_at,
      timeRemaining: this.calculateTimeRemaining(cooldown.expires_at),
      canEndEarly: this.canEndCooldownEarly(cooldown.expires_at)
    }));
  }

  static transformTopRulesData(rules: TopBreachedRule[]): Array<TopBreachedRule & { trendIndicator: string }> {
    return rules.map(rule => ({
      ...rule,
      trendIndicator: this.getTrendIndicator(rule.trendDirection, rule.deltaPercentage)
    }));
  }

  private static formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }

  private static calculateBreachSeverity(ruleType: string): 'low' | 'medium' | 'high' {
    const severityMap: { [key: string]: 'low' | 'medium' | 'high' } = {
      'max_active_trades': 'medium',
      'cooling_off': 'high',
      'same_direction_guard': 'low',
      'positive_pip_cancel_limit': 'medium'
    };
    return severityMap[ruleType] || 'medium';
  }

  private static calculateTimeRemaining(expiresAt: string): string {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInMinutes = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60));

    if (diffInMinutes < 0) return 'Expired';
    if (diffInMinutes < 60) return `${diffInMinutes}m remaining`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h remaining`;
    return `${Math.floor(diffInMinutes / 1440)}d remaining`;
  }

  private static canEndCooldownEarly(expiresAt: string): boolean {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours > 1; // Can only end early if more than 1 hour remaining
  }

  private static getTrendIndicator(direction: 'up' | 'down' | 'flat', percentage: number): string {
    if (direction === 'flat') return '→';
    if (direction === 'up') return `↑${percentage}%`;
    return `↓${Math.abs(percentage)}%`;
  }
}
