
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import BreachTable from '@/components/breaches/BreachTable';
import BreachFilter from '@/components/breaches/BreachFilter';

import { Market } from '@/types/database';
import { fetchBreachEvents, endCooldown } from '@/lib/api/breach-events';
import { fetchRuleSets } from '@/lib/api/rule-sets';

const BreachLogPage: React.FC = () => {
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const [providerSearch, setProviderSearch] = useState('');
  const [selectedRuleSet, setSelectedRuleSet] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date()
  });

  // Fetch rule sets for filter dropdown
  const { data: ruleSets = [] } = useQuery({
    queryKey: ['ruleSets'],
    queryFn: () => fetchRuleSets().then(res => res.data)
  });

  // Fetch breach events with filters
  const { data: breaches = [], isLoading, refetch } = useQuery({
    queryKey: ['breachEvents', selectedMarket, providerSearch, selectedRuleSet, dateRange],
    queryFn: () => fetchBreachEvents({
      market: selectedMarket,
      provider_search: providerSearch,
      rule_set_id: selectedRuleSet,
      date_range: dateRange
    }).then(res => res.data)
  });

  const handleEndCoolDown = async (id: string) => {
    try {
      const { error } = await endCooldown(id, 'Manually ended by admin');
      if (error) {
        toast.error('Failed to end cooldown');
        console.error('Error ending cooldown:', error);
      } else {
        toast.success('Cool-down ended successfully');
        refetch();
      }
    } catch (error) {
      toast.error('Failed to end cooldown');
      console.error('Error ending cooldown:', error);
    }
  };

  // Transform data to match component expectations
  const transformedBreaches = breaches.map(breach => ({
    id: breach.id,
    timestamp: breach.occurred_at,
    provider: breach.signal_provider?.provider_name || 'Unknown',
    market: breach.market,
    ruleSetId: breach.rule_set_id,
    ruleSetName: breach.rule_set?.name || 'Unknown',
    subRule: breach.sub_rule?.rule_type || 'Unknown',
    action: breach.action_taken === 'signal_rejected' ? 'Rejected' : 
            breach.action_taken === 'cooldown_triggered' ? 'Cooldown' : 'Limited',
    details: JSON.stringify(breach.details)
  }));

  const ruleSetOptions = ruleSets.map(rs => ({
    id: rs.id,
    name: rs.name
  }));

  return (
    <MainLayout>
      <Header title="Signal Governance – Breach Log" />
      
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
            breaches={transformedBreaches} 
            onEndCoolDown={handleEndCoolDown} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default BreachLogPage;
