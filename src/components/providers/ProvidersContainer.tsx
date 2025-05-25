
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProvidersFilter from './ProvidersFilter';
import ProvidersTable from './ProvidersTable';
import ProviderDrawer from './ProviderDrawer';
import { fetchProviders } from '@/lib/api/providers';
import { useProvidersFilters } from '@/hooks/useProvidersFilters';
import { Provider } from '@/types/provider';

const ProvidersContainer: React.FC = () => {
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);

  const {
    filters,
    setSearch,
    setMarket,
    setStatus,
    setPerformance,
    clearAllFilters,
    hasActiveFilters
  } = useProvidersFilters();

  const { data: fetchedProviders = [], isLoading } = useQuery({
    queryKey: ['providers', filters],
    queryFn: () => fetchProviders(filters),
    onSuccess: (data) => {
      setProviders(data);
    }
  });

  // Update providers when fetch completes
  React.useEffect(() => {
    setProviders(fetchedProviders);
  }, [fetchedProviders]);

  const selectedProvider = providers.find(p => p.id === selectedProviderId) || null;

  const handleProviderClick = (providerId: string) => {
    setSelectedProviderId(providerId);
  };

  const handleDrawerClose = () => {
    setSelectedProviderId(null);
  };

  const handleProviderUpdate = (providerId: string, updates: Partial<Provider>) => {
    setProviders(prev =>
      prev.map(provider =>
        provider.id === providerId
          ? { ...provider, ...updates }
          : provider
      )
    );
  };

  return (
    <>
      <ProvidersFilter
        search={filters.search}
        selectedMarket={filters.market}
        selectedStatus={filters.status}
        selectedPerformance={filters.performance}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearch}
        onMarketChange={setMarket}
        onStatusChange={setStatus}
        onPerformanceChange={setPerformance}
        onClearFilters={clearAllFilters}
      />
      
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No providers found matching your filters.</p>
          </div>
        ) : (
          <ProvidersTable 
            providers={providers} 
            onProviderClick={handleProviderClick}
          />
        )}
      </div>

      <ProviderDrawer
        isOpen={!!selectedProviderId}
        onClose={handleDrawerClose}
        providerId={selectedProviderId}
        provider={selectedProvider}
        onProviderUpdate={handleProviderUpdate}
      />
    </>
  );
};

export default ProvidersContainer;
