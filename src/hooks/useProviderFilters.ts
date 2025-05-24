
import { useCallback } from 'react';
import { ProviderState } from '@/types/dashboardFilters';

export const useProviderFilters = (
  provider: ProviderState,
  updateFilters: (filters: any) => Promise<void>
) => {
  const setProvider = useCallback(async (providerId: string | null, providerName: string | null) => {
    console.log('👤 Setting provider:', { providerId, providerName });
    await updateFilters({ provider: { providerId, providerName } });
  }, [updateFilters]);

  return {
    setProvider,
    isProviderFiltered: !!provider.providerId
  };
};
