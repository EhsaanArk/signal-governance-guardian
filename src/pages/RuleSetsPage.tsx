
import React from 'react';
import { useNavigate } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import RuleSetTable from '@/components/rulesets/RuleSetTable';
import RuleSetFilter from '@/components/rulesets/RuleSetFilter';

import { useRuleSets } from '@/hooks/useRuleSets';
import { useRuleSetFilters } from '@/hooks/useRuleSetFilters';

const RuleSetsPage = () => {
  const navigate = useNavigate();
  const {
    ruleSets,
    isLoading,
    handleDuplicate,
    handleDelete,
    handleStatusChange
  } = useRuleSets();
  
  const {
    selectedMarket,
    selectedStatus,
    filteredRuleSets,
    handleMarketChange,
    handleStatusFilterChange
  } = useRuleSetFilters(ruleSets);
  
  const handleCreateRuleSet = () => {
    navigate('/admin/rulesets/create');
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <Header 
          title="Signal Governance – Rule Sets"
          action={{
            label: '+ New Rule Set',
            onClick: handleCreateRuleSet
          }}
        />
        <div className="p-6">
          <div className="text-center">Loading rule sets...</div>
        </div>
      </MainLayout>
    );
  }
  
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
