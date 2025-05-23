
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import RuleSetTable from '@/components/rulesets/RuleSetTable';
import RuleSetFilter from '@/components/rulesets/RuleSetFilter';

import { Market, RuleStatus, RuleSet } from '@/types';

// Mock data for rule sets
const mockRuleSets: RuleSet[] = [
  {
    id: '1',
    name: 'Forex Standard Protection',
    description: 'Standard protection rules for forex traders',
    markets: ['Forex'],
    enabledRules: {
      coolingOff: true,
      sameDirectionGuard: true,
      maxActiveTrades: false,
      positivePipCancelLimit: false
    },
    breaches24h: 5,
    status: true,
    createdAt: '2025-05-17T10:00:00Z',
    updatedAt: '2025-05-18T15:30:00Z'
  },
  {
    id: '2',
    name: 'Crypto Enhanced Guard',
    description: 'Enhanced protection for volatile crypto markets',
    markets: ['Crypto'],
    enabledRules: {
      coolingOff: true,
      sameDirectionGuard: true,
      maxActiveTrades: true,
      positivePipCancelLimit: true
    },
    breaches24h: 12,
    status: true,
    createdAt: '2025-05-15T10:00:00Z',
    updatedAt: '2025-05-18T14:30:00Z'
  },
  {
    id: '3',
    name: 'Multi-Market Basic',
    description: 'Basic rules applicable to all market types',
    markets: ['Forex', 'Crypto', 'Indices'],
    enabledRules: {
      coolingOff: true,
      sameDirectionGuard: false,
      maxActiveTrades: true,
      positivePipCancelLimit: false
    },
    breaches24h: 8,
    status: false,
    createdAt: '2025-05-14T10:00:00Z',
    updatedAt: '2025-05-16T11:30:00Z'
  },
];

const RuleSetsPage = () => {
  const navigate = useNavigate();
  const [ruleSets, setRuleSets] = useState<RuleSet[]>(mockRuleSets);
  const [selectedMarket, setSelectedMarket] = useState<Market>('All');
  const [selectedStatus, setSelectedStatus] = useState<RuleStatus>('All');
  const [filteredRuleSets, setFilteredRuleSets] = useState<RuleSet[]>(mockRuleSets);
  
  useEffect(() => {
    // Filter rule sets based on selected market and status
    const filtered = ruleSets.filter(ruleSet => {
      const marketMatch = 
        selectedMarket === 'All' || 
        ruleSet.markets.includes(selectedMarket);
      
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
          ? { ...rs, status: enabled, updatedAt: new Date().toISOString() } 
          : rs
      )
    );
  };
  
  const handleMarketChange = (market: Market) => {
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
