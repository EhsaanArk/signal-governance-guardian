
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import RuleSetTable from '@/components/rulesets/RuleSetTable';
import RuleSetFilter from '@/components/rulesets/RuleSetFilter';

import { Market, RuleStatus, CompleteRuleSet } from '@/types';

// Mock data for rule sets
const mockRuleSets: CompleteRuleSet[] = [
  {
    id: '1',
    name: 'Forex Standard Protection',
    description: 'Standard protection rules for forex traders',
    markets: ['Forex'],
    is_active: true,
    created_at: '2025-05-17T10:00:00Z',
    updated_at: '2025-05-18T15:30:00Z',
    created_by: undefined,
    enabledRules: {
      coolingOff: true,
      sameDirectionGuard: true,
      maxActiveTrades: false,
      positivePipCancelLimit: false
    },
    breaches24h: 5,
    status: true,
    coolingOff: { enabled: true, tiers: [], metric: 'SLCount' },
    sameDirectionGuard: { enabled: true, pairScope: 'All', directions: { long: true, short: true } },
    maxActiveTrades: { enabled: false, baseCap: 3, incrementPerWin: 1, hardCap: null, resetPolicy: 'Never' },
    positivePipCancelLimit: { enabled: false, plBand: { from: 0, to: 5 }, minHoldTime: 5, maxCancels: 2, window: 'UTCDay', suspensionDuration: 24 }
  },
  {
    id: '2',
    name: 'Crypto Enhanced Guard',
    description: 'Enhanced protection for volatile crypto markets',
    markets: ['Crypto'],
    is_active: true,
    created_at: '2025-05-15T10:00:00Z',
    updated_at: '2025-05-18T14:30:00Z',
    created_by: undefined,
    enabledRules: {
      coolingOff: true,
      sameDirectionGuard: true,
      maxActiveTrades: true,
      positivePipCancelLimit: true
    },
    breaches24h: 12,
    status: true,
    coolingOff: { enabled: true, tiers: [], metric: 'SLCount' },
    sameDirectionGuard: { enabled: true, pairScope: 'All', directions: { long: true, short: true } },
    maxActiveTrades: { enabled: true, baseCap: 2, incrementPerWin: 1, hardCap: 8, resetPolicy: 'Monthly' },
    positivePipCancelLimit: { enabled: true, plBand: { from: 0, to: 10 }, minHoldTime: 10, maxCancels: 3, window: 'UTCDay', suspensionDuration: 12 }
  },
  {
    id: '3',
    name: 'Multi-Market Basic',
    description: 'Basic rules applicable to all market types',
    markets: ['Forex', 'Crypto', 'Indices'],
    is_active: false,
    created_at: '2025-05-14T10:00:00Z',
    updated_at: '2025-05-16T11:30:00Z',
    created_by: undefined,
    enabledRules: {
      coolingOff: true,
      sameDirectionGuard: false,
      maxActiveTrades: true,
      positivePipCancelLimit: false
    },
    breaches24h: 8,
    status: false,
    coolingOff: { enabled: true, tiers: [], metric: 'SLCount' },
    sameDirectionGuard: { enabled: false, pairScope: 'All', directions: { long: true, short: true } },
    maxActiveTrades: { enabled: true, baseCap: 5, incrementPerWin: 2, hardCap: 15, resetPolicy: 'OnFirstSL' },
    positivePipCancelLimit: { enabled: false, plBand: { from: 2, to: 15 }, minHoldTime: 5, maxCancels: 2, window: 'UTCDay', suspensionDuration: 24 }
  },
];

const RuleSetsPage = () => {
  const navigate = useNavigate();
  const [ruleSets, setRuleSets] = useState<CompleteRuleSet[]>(mockRuleSets);
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<RuleStatus>('All');
  const [filteredRuleSets, setFilteredRuleSets] = useState<CompleteRuleSet[]>(mockRuleSets);
  
  useEffect(() => {
    // Filter rule sets based on selected market and status
    const filtered = ruleSets.filter(ruleSet => {
      const marketMatch = 
        selectedMarket === 'All' || 
        ruleSet.markets.includes(selectedMarket as Market);
      
      const statusMatch = 
        selectedStatus === 'All' || 
        (selectedStatus === 'On' && ruleSet.status) || 
        (selectedStatus === 'Off' && !ruleSet.status);
      
      return marketMatch && statusMatch;
    });
    
    setFilteredRuleSets(filtered);
  }, [ruleSets, selectedMarket, selectedStatus]);
  
  const handleCreateRuleSet = () => {
    navigate('/admin/rulesets/create');
  };
  
  const handleDuplicate = (id: string) => {
    const ruleSetToDuplicate = ruleSets.find(rs => rs.id === id);
    
    if (ruleSetToDuplicate) {
      const newRuleSet = {
        ...ruleSetToDuplicate,
        id: uuidv4(),
        name: `${ruleSetToDuplicate.name} (copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        breaches24h: 0
      };
      
      setRuleSets([...ruleSets, newRuleSet]);
      toast.success(`Rule Set "${ruleSetToDuplicate.name}" duplicated successfully`);
    }
  };
  
  const handleDelete = (ids: string[]) => {
    setRuleSets(prev => prev.filter(rs => !ids.includes(rs.id)));
  };
  
  const handleStatusChange = (id: string, enabled: boolean) => {
    setRuleSets(prev => 
      prev.map(rs => 
        rs.id === id 
          ? { ...rs, status: enabled, is_active: enabled, updated_at: new Date().toISOString() } 
          : rs
      )
    );
  };
  
  const handleMarketChange = (market: Market | 'All') => {
    setSelectedMarket(market);
  };
  
  const handleStatusFilterChange = (status: RuleStatus) => {
    setSelectedStatus(status);
  };
  
  return (
    <MainLayout>
      <Header 
        title="Signal Governance – Rule Sets"
        action={{
          label: '+ New Rule Set',
          onClick: handleCreateRuleSet
        }}
      />
      
      <RuleSetFilter
        selectedMarket={selectedMarket}
        selectedStatus={selectedStatus}
        onMarketChange={handleMarketChange}
        onStatusChange={handleStatusFilterChange}
      />
      
      <div className="p-6">
        <RuleSetTable 
          ruleSets={filteredRuleSets} 
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>
    </MainLayout>
  );
};

export default RuleSetsPage;
