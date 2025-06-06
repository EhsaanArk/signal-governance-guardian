
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
    
    // Changed default check from 24h to 30d
    if (context.timeRange?.preset !== '30d') {
      const label = this.getTimeRangeDisplayLabel(context.timeRange);
      parts.push(`in ${label.toLowerCase()}`);
    }
    
    return parts.length > 0 ? parts.join(' ') : '';
  }

  static getTimeRangeDisplayLabel(timeRange?: { preset: TimeRangePreset; from: Date; to: Date }): string {
    if (!timeRange) return 'Last 30 days';
    
    if (timeRange.preset === 'custom') {
      return `${timeRange.from.toLocaleDateString()} - ${timeRange.to.toLocaleDateString()}`;
    }
    
    const labels = {
      '24h': 'Last 24 hours',
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days'
    };
    
    return labels[timeRange.preset] || 'Last 30 days';
  }

  static getApiDateParams(filters: FilterContext) {
    const timeRange = filters.timeRange || {
      preset: '30d' as TimeRangePreset,
      ...getDefaultDateRange('30d')
    };
    
    // Fix: Properly handle null/undefined providerId without serialization
    const providerId = filters.provider?.providerId;
    const cleanProviderId = providerId && providerId !== 'undefined' ? providerId : undefined;
    
    const params = {
      startDate: timeRange.from.toISOString(),
      endDate: timeRange.to.toISOString(),
      providerId: cleanProviderId
    };
    
    console.log('🌐 Clean API params:', params);
    return params;
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
    return labels[preset] || '30-d';
  }

  static getPeriodLabel(preset: TimeRangePreset): string {
    const labels = {
      '24h': 'last 24 hours',
      '7d': 'last 7 days',
      '30d': 'last 30 days',
      '90d': 'last 90 days',
      'custom': 'selected period'
    };
    return labels[preset] || 'last 30 days';
  }
}
