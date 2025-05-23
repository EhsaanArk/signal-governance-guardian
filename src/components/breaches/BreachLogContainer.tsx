
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import BreachFilter from './BreachFilter';
import BreachTable from './BreachTable';
import { fetchRuleSets } from '@/lib/api/rule-sets';
import { useBreachEvents } from '@/hooks/useBreachEvents';

const BreachLogContainer: React.FC = () => {
  const {
    selectedMarket,
    setSelectedMarket,
    providerSearch,
    setProviderSearch,
    selectedRuleSet,
    setSelectedRuleSet,
    dateRange,
    setDateRange,
    breaches,
    isLoading,
    handleEndCoolDown
  } = useBreachEvents();

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
        selectedMarket={selectedMarket}
        providerSearch={providerSearch}
        selectedRuleSet={selectedRuleSet}
        dateRange={dateRange}
        ruleSets={ruleSetOptions}
        onMarketChange={setSelectedMarket}
        onProviderSearchChange={setProviderSearch}
        onRuleSetChange={setSelectedRuleSet}
        onDateRangeChange={setDateRange}
      />
      
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading breach events...</p>
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
