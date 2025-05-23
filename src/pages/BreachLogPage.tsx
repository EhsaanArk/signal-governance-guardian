
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
import { supabase } from '@/integrations/supabase/client';
import { endCooldown } from '@/lib/api/breach-events';
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

  // Fetch breach events with real-time data from database
  const { data: breaches = [], isLoading, refetch } = useQuery({
    queryKey: ['breachEvents', selectedMarket, providerSearch, selectedRuleSet, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('breach_events')
        .select(`
          id,
          occurred_at,
          market,
          action_taken,
          details,
          signal_data,
          rule_set_id,
          signal_providers!provider_id(provider_name),
          rule_sets!rule_set_id(name),
          sub_rules!sub_rule_id(rule_type)
        `)
        .order('occurred_at', { ascending: false });

      // Apply market filter
      if (selectedMarket !== 'All') {
        query = query.eq('market', selectedMarket);
      }

      // Apply rule set filter
      if (selectedRuleSet !== 'all') {
        query = query.eq('rule_set_id', selectedRuleSet);
      }

      // Apply date range filter
      if (dateRange?.from) {
        query = query.gte('occurred_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('occurred_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching breach events:', error);
        throw error;
      }

      // Transform data and apply provider search filter
      let transformedData = (data || []).map(breach => ({
        id: breach.id,
        timestamp: breach.occurred_at,
        provider: breach.signal_providers?.provider_name || 'Unknown',
        market: breach.market,
        ruleSetId: breach.rule_set_id,
        ruleSetName: breach.rule_sets?.name || 'Unknown',
        subRule: breach.sub_rules?.rule_type || 'Unknown',
        action: breach.action_taken === 'signal_rejected' ? 'Rejected' : 
                breach.action_taken === 'cooldown_triggered' ? 'Cooldown' : 
                breach.action_taken === 'suspension_applied' ? 'Suspended' : 'Limited',
        details: typeof breach.details === 'object' ? JSON.stringify(breach.details) : String(breach.details || '')
      }));

      // Apply provider search filter
      if (providerSearch.trim()) {
        transformedData = transformedData.filter(breach =>
          breach.provider.toLowerCase().includes(providerSearch.toLowerCase())
        );
      }

      return transformedData;
    }
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
            breaches={breaches} 
            onEndCoolDown={handleEndCoolDown} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default BreachLogPage;
