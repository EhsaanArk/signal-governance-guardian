
import { DashboardMetrics } from '@/lib/api/types';
import { TimeRangePreset } from '@/hooks/useDashboardFilters';
import { DashboardFiltersService, FilterContext } from './DashboardFiltersService';

export interface KPICard {
  title: string;
  tooltip: string;
  value: string | number;
  displayValue?: number;
  timeLabel?: string;
  icon: React.ElementType;
  change: number;
  isGoodWhenIncreasing: boolean;
  onClick: () => void;
}

export class KPIMetricsService {
  static buildKPICards(
    metrics: DashboardMetrics | undefined,
    context: FilterContext,
    navigationHandlers: {
      navigateToCooldowns: () => void;
      navigateToBreaches: () => void;
      navigateToProviders: () => void;
      navigateToProvidersReview: () => void;
    }
  ): KPICard[] {
    const { ArrowUp, ArrowDown, Clock, AlertTriangle, TrendingUp, Users } = require('lucide-react');
    
    const timeLabel = DashboardFiltersService.getTimeLabel(context.timeRange?.preset || '24h');
    const periodLabel = DashboardFiltersService.getPeriodLabel(context.timeRange?.preset || '24h');
    const providerContext = DashboardFiltersService.getDisplayContext(context);

    return [
      {
        title: 'Active Cool-downs',
        tooltip: `Sum of unique providers currently in any cooldown period${providerContext ? ` ${providerContext}` : ''}`,
        value: metrics?.activeCooldowns || 0,
        icon: Clock,
        change: metrics?.cooldownChange || 0,
        isGoodWhenIncreasing: false,
        onClick: navigationHandlers.navigateToCooldowns,
      },
      {
        title: `${timeLabel} Breaches`,
        tooltip: `Total number of rule breaches detected in the ${periodLabel}${providerContext ? ` ${providerContext}` : ''}`,
        value: metrics?.breaches || 0,
        icon: AlertTriangle,
        change: metrics?.breachChange || 0,
        isGoodWhenIncreasing: false,
        onClick: navigationHandlers.navigateToBreaches,
      },
      {
        title: `${timeLabel} Win-rate`,
        tooltip: `Percentage of profitable trades executed in the ${periodLabel}${providerContext ? ` ${providerContext}` : ''}`,
        value: `${metrics?.winRate || 0}%`,
        displayValue: metrics?.winRate || 0,
        timeLabel,
        icon: TrendingUp,
        change: metrics?.winRateChange || 0,
        isGoodWhenIncreasing: true,
        onClick: navigationHandlers.navigateToProviders,
      },
      {
        title: 'Providers In Review',
        tooltip: 'Number of signal providers currently under performance review',
        value: metrics?.providersInReview || 0,
        icon: Users,
        change: metrics?.reviewChange || 0,
        isGoodWhenIncreasing: false,
        onClick: navigationHandlers.navigateToProvidersReview,
      },
    ];
  }

  static getDeltaColor(change: number, isGoodWhenIncreasing: boolean): string {
    if (change === 0) return 'text-muted-foreground';
    
    const isIncreasing = change > 0;
    const isGoodChange = isGoodWhenIncreasing ? isIncreasing : !isIncreasing;
    
    return isGoodChange ? 'text-green-600' : 'text-red-600';
  }

  static hasSignificantChange(change: number): boolean {
    return Math.abs(change) >= 5;
  }
}
