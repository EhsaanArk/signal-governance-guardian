
export type TimeRangePreset = '24h' | '7d' | '30d' | '90d' | 'custom';

export interface TimeRangeState {
  preset: TimeRangePreset;
  from: Date;
  to: Date;
}

export interface ProviderState {
  providerId: string | null;
  providerName: string | null;
}

export interface DashboardFiltersState {
  timeRange: TimeRangeState;
  provider: ProviderState;
}

export const TIME_RANGE_PRESETS = {
  '24h': { label: 'Last 24 hours', hours: 24 },
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
  'custom': { label: 'Custom range' }
} as const;
