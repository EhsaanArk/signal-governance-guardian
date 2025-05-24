
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
  staleTime: 0, // Consider data stale immediately for fresh filter changes
  gcTime: 2 * 60 * 1000, // Reduced cache time to 2 minutes for faster updates
  refetchInterval: 30000, // Refetch every 30 seconds for active queries
  refetchOnWindowFocus: true, // Refetch when window gains focus
  refetchOnMount: true, // Always refetch on mount
  refetchOnReconnect: true, // Refetch on network reconnect
  retry: 1, // Reduce retries for faster feedback
} as const;
