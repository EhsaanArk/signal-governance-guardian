
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ProvidersFilter from './ProvidersFilter';
import ProvidersTable from './ProvidersTable';
import { fetchProviders } from '@/lib/api/providers';
import { useProvidersFilters } from '@/hooks/useProvidersFilters';

const ProvidersContainer: React.FC = () => {
  const {
    filters,
    setSearch,
    setMarket,
    setStatus,
    setPerformance,
    clearAllFilters,
    hasActiveFilters
  } = useProvidersFilters();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers', filters],
    queryFn: () => fetchProviders(filters)
  });

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
          <ProvidersTable providers={providers} />
        )}
      </div>
    </>
  );
};

export default ProvidersContainer;
