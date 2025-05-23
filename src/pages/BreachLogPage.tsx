
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import BreachTable from '@/components/breaches/BreachTable';
import BreachFilter from '@/components/breaches/BreachFilter';

import { Market, BreachLog } from '@/types';

// Mock data for breach logs
const mockBreachLogs: BreachLog[] = [
  {
    id: '1',
    timestamp: '2025-05-20T10:30:00Z',
    provider: 'AlphaTrader',
    market: 'Forex',
    ruleSetId: '1',
    ruleSetName: 'Forex Standard Protection',
    subRule: 'Cooling-Off (SL-based)',
    action: 'Cooldown',
    details: 'Hit 2 stop-losses within 12h in Forex. New signals blocked until 2025-05-21T10:30:00Z.'
  },
  {
    id: '2',
    timestamp: '2025-05-20T12:45:00Z',
    provider: 'CryptoWhale',
    market: 'Crypto',
    ruleSetId: '2',
    ruleSetName: 'Crypto Enhanced Guard',
    subRule: 'Positive-Pip Cancel-Limit',
    action: 'Rejected',
    details: 'Signal rejected: daily limit of early cancellations reached (3 / 2 allowed).'
  },
  {
    id: '3',
    timestamp: '2025-05-19T14:20:00Z',
    provider: 'IndexMaster',
    market: 'Indices',
    ruleSetId: '3',
    ruleSetName: 'Multi-Market Basic',
    subRule: 'Max Active Trades',
    action: 'Limited',
    details: 'Maximum active trade limit reached (10). Signal will be accepted once a position closes.'
  },
  {
    id: '4',
    timestamp: '2025-05-19T09:15:00Z',
    provider: 'AlphaTrader',
    market: 'Forex',
    ruleSetId: '1',
    ruleSetName: 'Forex Standard Protection',
    subRule: 'Same-Direction Guard',
    action: 'Rejected',
    details: 'Rejected consecutive long position on the same pair within cool-off period.'
  },
];

const mockRuleSets = [
  { id: '1', name: 'Forex Standard Protection' },
  { id: '2', name: 'Crypto Enhanced Guard' },
  { id: '3', name: 'Multi-Market Basic' },
];

const BreachLogPage: React.FC = () => {
  const [breaches, setBreaches] = useState<BreachLog[]>(mockBreachLogs);
  const [filteredBreaches, setFilteredBreaches] = useState<BreachLog[]>(mockBreachLogs);
  
  const [selectedMarket, setSelectedMarket] = useState<Market>('All');
  const [providerSearch, setProviderSearch] = useState('');
  const [selectedRuleSet, setSelectedRuleSet] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  
  useEffect(() => {
    // Filter breaches based on selected filters
    const filtered = breaches.filter(breach => {
      // Market filter
      const marketMatch = selectedMarket === 'All' || breach.market === selectedMarket;
      
      // Provider search
      const providerMatch = providerSearch === '' || 
        breach.provider.toLowerCase().includes(providerSearch.toLowerCase());
      
      // Rule set filter
      const ruleSetMatch = selectedRuleSet === 'all' || breach.ruleSetId === selectedRuleSet;
      
      // Date range filter
      const breachDate = new Date(breach.timestamp);
      const dateMatch = (!dateRange?.from || breachDate >= dateRange.from) && 
                       (!dateRange?.to || breachDate <= dateRange.to);
      
      return marketMatch && providerMatch && ruleSetMatch && dateMatch;
    });
    
    setFilteredBreaches(filtered);
  }, [breaches, selectedMarket, providerSearch, selectedRuleSet, dateRange]);
  
  const handleEndCoolDown = (id: string) => {
    // In a real application, this would make an API request to end the cooldown
    toast.success('Cool-down ended successfully');
  };
  
  return (
    <MainLayout>
      <Header title="Signal Governance – Breach Log" />
      
      <BreachFilter
        selectedMarket={selectedMarket}
        providerSearch={providerSearch}
        selectedRuleSet={selectedRuleSet}
        dateRange={dateRange}
        ruleSets={mockRuleSets}
        onMarketChange={setSelectedMarket}
        onProviderSearchChange={setProviderSearch}
        onRuleSetChange={setSelectedRuleSet}
        onDateRangeChange={setDateRange}
      />
      
      <div className="p-6">
        <BreachTable 
          breaches={filteredBreaches} 
          onEndCoolDown={handleEndCoolDown} 
        />
      </div>
    </MainLayout>
  );
};

export default BreachLogPage;
