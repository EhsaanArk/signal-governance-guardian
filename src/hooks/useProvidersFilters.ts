import { useState, useMemo } from 'react';
import { Market } from '@/types/database';

type ProviderStatus = 'All' | 'Active' | 'Suspended' | 'Review';
type PerformanceTier = 'All' | 'Top' | 'Neutral' | 'Under-perform';

export interface ProvidersFilters {
  search: string;
  market: Market | 'All';
  status: ProviderStatus;
  performance: PerformanceTier;
}

export const useProvidersFilters = () => {
  const [search, setSearch] = useState('');
  const [market, setMarket] = useState<Market | 'All'>('All');
  const [status, setStatus] = useState<ProviderStatus>('All');
  const [performance, setPerformance] = useState<PerformanceTier>('All');

  const filters: ProvidersFilters = useMemo(() => ({
    search,
    market,
    status,
    performance
  }), [search, market, status, performance]);

  const hasActiveFilters = useMemo(() => {
    return search !== '' || 
           market !== 'All' || 
           status !== 'All' || 
           performance !== 'All';
  }, [search, market, status, performance]);

  const resetAllFilters = () => {
    setSearch('');
    setMarket('All');
    setStatus('All');
    setPerformance('All');
  };

  // Keep the old name for backward compatibility
  const clearAllFilters = resetAllFilters;

  return {
    filters,
    setSearch,
    setMarket,
    setStatus,
    setPerformance,
    clearAllFilters,
    resetAllFilters,
    hasActiveFilters
  };
};
