
export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    metrics: (startDate?: string, endDate?: string, providerId?: string, preset?: string) =>
      [...queryKeys.dashboard.all, 'metrics', startDate, endDate, providerId, preset] as const,
    heatmap: (startDate?: string, endDate?: string, providerId?: string, preset?: string) =>
      [...queryKeys.dashboard.all, 'heatmap', startDate, endDate, providerId, preset] as const,
    topRules: (market?: string, startDate?: string, endDate?: string, providerId?: string, preset?: string) =>
      [...queryKeys.dashboard.all, 'top-rules', market, startDate, endDate, providerId, preset] as const,
    recentBreaches: (startDate?: string, endDate?: string, providerId?: string, preset?: string) =>
      [...queryKeys.dashboard.all, 'recent-breaches', startDate, endDate, providerId, preset] as const,
    expiringCooldowns: (providerId?: string) =>
      [...queryKeys.dashboard.all, 'expiring-cooldowns', providerId] as const,
  },
  providers: {
    all: ['providers'] as const,
    list: (searchValue?: string) =>
      [...queryKeys.providers.all, 'list', searchValue] as const,
  },
} as const;

export const defaultQueryOptions = {
  staleTime: 5 * 1000, // Consider data stale after 5 seconds
  gcTime: 30 * 1000, // Keep in cache for 30 seconds
  refetchInterval: false, // Disable background refetch
  refetchOnWindowFocus: false, // Disable to avoid conflicts
  refetchOnMount: true, // Always refetch on mount
  refetchOnReconnect: true, // Refetch on network reconnect
  retry: 1, // Minimal retry for faster feedback
  retryDelay: 500, // Quick retry
} as const;
