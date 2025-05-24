
import { TimeRangePreset } from '@/hooks/useDashboardFilters';
import { getDefaultDateRange } from '@/lib/utils/dateUtils';

export interface FilterContext {
  provider?: {
    providerId: string | null;
    providerName: string | null;
  };
  timeRange?: {
    preset: TimeRangePreset;
    from: Date;
    to: Date;
  };
}

export class DashboardFiltersService {
  static getDisplayContext(context: FilterContext): string {
    const parts = [];
    
    if (context.provider?.providerName) {
      parts.push(`for ${context.provider.providerName}`);
    }
    
    if (context.timeRange?.preset !== '24h') {
      const label = this.getTimeRangeDisplayLabel(context.timeRange);
      parts.push(`in ${label.toLowerCase()}`);
    }
    
    return parts.length > 0 ? parts.join(' ') : '';
  }

  static getTimeRangeDisplayLabel(timeRange?: { preset: TimeRangePreset; from: Date; to: Date }): string {
    if (!timeRange) return 'Last 24 hours';
    
    if (timeRange.preset === 'custom') {
      return `${timeRange.from.toLocaleDateString()} - ${timeRange.to.toLocaleDateString()}`;
    }
    
    const labels = {
      '24h': 'Last 24 hours',
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days'
    };
    
    return labels[timeRange.preset] || 'Last 24 hours';
  }

  static getApiDateParams(filters: FilterContext) {
    const timeRange = filters.timeRange || {
      preset: '24h' as TimeRangePreset,
      ...getDefaultDateRange('24h')
    };
    
    return {
      startDate: timeRange.from.toISOString(),
      endDate: timeRange.to.toISOString(),
      providerId: filters.provider?.providerId || undefined
    };
  }

  static getContextualTitle(baseTitle: string, context: FilterContext): string {
    const displayContext = this.getDisplayContext(context);
    return displayContext ? `${baseTitle} ${displayContext}` : baseTitle;
  }

  static getTimeLabel(preset: TimeRangePreset): string {
    const labels = {
      '24h': '24-h',
      '7d': '7-d',
      '30d': '30-d',
      '90d': '90-d',
      'custom': 'Period'
    };
    return labels[preset] || '24-h';
  }

  static getPeriodLabel(preset: TimeRangePreset): string {
    const labels = {
      '24h': 'last 24 hours',
      '7d': 'last 7 days',
      '30d': 'last 30 days',
      '90d': 'last 90 days',
      'custom': 'selected period'
    };
    return labels[preset] || 'last 24 hours';
  }
}
