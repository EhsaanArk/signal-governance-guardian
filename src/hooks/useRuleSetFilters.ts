
import { useState, useEffect } from 'react';
import { Market, RuleStatus, CompleteRuleSet } from '@/types';

export const useRuleSetFilters = (ruleSets: CompleteRuleSet[]) => {
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<RuleStatus>('All');
  const [filteredRuleSets, setFilteredRuleSets] = useState<CompleteRuleSet[]>([]);
  
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
  
  const handleMarketChange = (market: Market | 'All') => {
    setSelectedMarket(market);
  };
  
  const handleStatusFilterChange = (status: RuleStatus) => {
    setSelectedStatus(status);
  };
  
  return {
    selectedMarket,
    selectedStatus,
    filteredRuleSets,
    handleMarketChange,
    handleStatusFilterChange
  };
};
