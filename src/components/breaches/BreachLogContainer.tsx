
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import BreachFilter from './BreachFilter';
import BreachTable from './BreachTable';
import { fetchRuleSets } from '@/lib/api/rule-sets';
import { useBreachFilters } from '@/hooks/useBreachFilters';
import { useBreachEventsWithFilters } from '@/hooks/useBreachEventsWithFilters';

const BreachLogContainer: React.FC = () => {
  const {
    filters,
    setTimeRangePreset,
    setCustomDateRange,
    setProvider,
    setMarket,
    setRuleSet,
    setProviderSearch,
    clearAllFilters,
    hasActiveFilters
  } = useBreachFilters();

  const {
    breaches,
    isLoading,
    handleEndCoolDown
  } = useBreachEventsWithFilters(filters);

  // Fetch rule sets for filter dropdown
  const { data: ruleSets = [] } = useQuery({
    queryKey: ['ruleSets'],
    queryFn: () => fetchRuleSets().then(res => res.data)
  });

  const ruleSetOptions = ruleSets.map(rs => ({
    id: rs.id,
    name: rs.name
  }));

  return (
    <>
      <BreachFilter
        selectedMarket={filters.market}
        providerSearch={filters.providerSearch}
        selectedRuleSet={filters.ruleSetId}
        timeRangePreset={filters.timeRangePreset}
        dateRange={filters.dateRange}
        selectedProviderId={filters.providerId}
        selectedProviderName={filters.providerName}
        hasActiveFilters={hasActiveFilters}
        ruleSets={ruleSetOptions}
        onMarketChange={setMarket}
        onProviderSearchChange={setProviderSearch}
        onRuleSetChange={setRuleSet}
        onTimeRangePresetChange={setTimeRangePreset}
        onCustomDateRangeChange={setCustomDateRange}
        onProviderChange={setProvider}
        onClearFilters={clearAllFilters}
      />
      
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading breach events...</p>
          </div>
        ) : breaches.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No breaches found for selected filters.</p>
          </div>
        ) : (
          <BreachTable 
            breaches={breaches} 
            onEndCoolDown={handleEndCoolDown} 
          />
        )}
      </div>
    </>
  );
};

export default BreachLogContainer;
