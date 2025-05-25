
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProvidersFilter from './ProvidersFilter';
import ProvidersTable from './ProvidersTable';
import ProviderDrawer from './ProviderDrawer';
import BulkToolbar from './BulkToolbar';
import BulkConfirmModal from './BulkConfirmModal';
import AssignRuleSetModal from './AssignRuleSetModal';
import { fetchProviders } from '@/lib/api/providers';
import { useProvidersFilters } from '@/hooks/useProvidersFilters';
import { useToast } from '@/hooks/use-toast';
import { Provider } from '@/types/provider';

const ProvidersContainer: React.FC = () => {
  const { toast } = useToast();
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'reinstate'>('suspend');
  const [assignRuleSetModalOpen, setAssignRuleSetModalOpen] = useState(false);

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
  });

  // Update providers when fetch completes
  React.useEffect(() => {
    setProviders(fetchedProviders);
    // Clear selection when data changes (e.g., pagination, filtering)
    setSelectedProviders([]);
  }, [fetchedProviders]);

  const selectedProvider = providers.find(p => p.id === selectedProviderId) || null;
  const selectedProviderObjects = providers.filter(p => selectedProviders.includes(p.id));

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

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviders(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProviders.length === providers.length) {
      setSelectedProviders([]);
    } else {
      setSelectedProviders(providers.map(p => p.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedProviders([]);
  };

  const handleBulkSuspend = () => {
    setConfirmAction('suspend');
    setConfirmModalOpen(true);
  };

  const handleBulkReinstate = () => {
    setConfirmAction('reinstate');
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    const newStatus = confirmAction === 'suspend' ? 'Suspended' : 'Active';
    const actionText = confirmAction === 'suspend' ? 'suspended' : 'reinstated';
    
    // Update providers that match the action
    setProviders(prev =>
      prev.map(provider => {
        if (selectedProviders.includes(provider.id)) {
          // Only update if the action is relevant to the current status
          if (confirmAction === 'suspend' && provider.status === 'Active') {
            return { ...provider, status: newStatus as Provider['status'] };
          } else if (confirmAction === 'reinstate' && provider.status === 'Suspended') {
            return { ...provider, status: newStatus as Provider['status'] };
          }
        }
        return provider;
      })
    );

    toast({
      title: `Providers ${actionText} (mock)`,
      description: `${selectedProviderObjects.length} provider${selectedProviderObjects.length > 1 ? 's' : ''} ${actionText}`,
    });

    setConfirmModalOpen(false);
    setSelectedProviders([]);
  };

  const handleBulkAssignRuleSets = () => {
    setAssignRuleSetModalOpen(true);
  };

  const handleAssignRuleSetModalClose = () => {
    setAssignRuleSetModalOpen(false);
    setSelectedProviders([]);
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
      
      <div className="p-6 pb-20">
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
            selectedProviders={selectedProviders}
            onProviderClick={handleProviderClick}
            onProviderSelect={handleProviderSelect}
            onSelectAll={handleSelectAll}
          />
        )}
      </div>

      <BulkToolbar
        selectedCount={selectedProviders.length}
        selectedProviders={selectedProviderObjects}
        onSuspend={handleBulkSuspend}
        onReinstate={handleBulkReinstate}
        onAssignRuleSets={handleBulkAssignRuleSets}
        onClearSelection={handleClearSelection}
      />

      <BulkConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        action={confirmAction}
        providers={selectedProviderObjects}
      />

      <AssignRuleSetModal
        isOpen={assignRuleSetModalOpen}
        onClose={handleAssignRuleSetModalClose}
        isBulk={true}
        providerNames={selectedProviderObjects.map(p => p.provider_name)}
      />

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
