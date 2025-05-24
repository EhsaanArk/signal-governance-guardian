
import { TimeRangePreset } from '@/hooks/useDashboardFilters';

export interface NavigationParams {
  timeRange?: {
    preset: TimeRangePreset;
    from: Date;
    to: Date;
  };
  provider?: {
    providerId: string | null;
    providerName: string | null;
  };
}

export class NavigationService {
  static buildBreachesUrl(params: NavigationParams): string {
    const urlParams = new URLSearchParams();
    
    if (params.timeRange) {
      if (params.timeRange.preset !== '24h') {
        urlParams.set('from', params.timeRange.from.toISOString().split('T')[0]);
        urlParams.set('to', params.timeRange.to.toISOString().split('T')[0]);
      } else {
        urlParams.set('period', '24h');
      }
    }
    
    if (params.provider?.providerId) {
      urlParams.set('provider', params.provider.providerId);
    }
    
    const queryString = urlParams.toString();
    return `/admin/breaches${queryString ? `?${queryString}` : ''}`;
  }

  static buildProvidersUrl(params?: { sort?: string; status?: string }): string {
    const urlParams = new URLSearchParams();
    
    if (params?.sort) {
      urlParams.set('sort', params.sort);
    }
    
    if (params?.status) {
      urlParams.set('status', params.status);
    }
    
    const queryString = urlParams.toString();
    return `/admin/providers${queryString ? `?${queryString}` : ''}`;
  }
}
