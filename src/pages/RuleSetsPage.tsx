import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import RuleSetTable from '@/components/rulesets/RuleSetTable';
import RuleSetFilter from '@/components/rulesets/RuleSetFilter';

import { fetchRuleSets, updateRuleSet, deleteRuleSet } from '@/lib/api/rule-sets';
import { supabase } from '@/integrations/supabase/client';
import { Market, RuleStatus, CompleteRuleSet } from '@/types';

const RuleSetsPage = () => {
  const navigate = useNavigate();
  const [ruleSets, setRuleSets] = useState<CompleteRuleSet[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<RuleStatus>('All');
  const [filteredRuleSets, setFilteredRuleSets] = useState<CompleteRuleSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load rule sets from database
  useEffect(() => {
    loadRuleSets();
  }, []);
  
  const loadRuleSets = async () => {
    try {
      setIsLoading(true);
      console.log('Loading rule sets from database...');
      
      const { data: ruleSetData, error } = await fetchRuleSets();
      
      if (error) {
        console.error('Error fetching rule sets:', error);
        toast.error('Failed to load rule sets');
        return;
      }
      
      console.log('Fetched rule sets:', ruleSetData);
      
      // Fetch sub-rules for each rule set to determine enabled rules
      const ruleSetPromises = ruleSetData.map(async (ruleSet) => {
        const { data: subRules } = await supabase
          .from('sub_rules')
          .select('*')
          .eq('rule_set_id', ruleSet.id)
          .eq('is_enabled', true);
        
        console.log(`Sub-rules for ${ruleSet.name}:`, subRules);
        
        // Transform to CompleteRuleSet format
        const enabledRules = {
          coolingOff: subRules?.some(rule => rule.rule_type === 'cooling_off') || false,
          sameDirectionGuard: subRules?.some(rule => rule.rule_type === 'same_direction_guard') || false,
          maxActiveTrades: subRules?.some(rule => rule.rule_type === 'max_active_trades') || false,
          positivePipCancelLimit: subRules?.some(rule => rule.rule_type === 'positive_pip_cancel_limit') || false,
        };
        
        // Get rule configurations with proper type casting
        const coolingOffRule = subRules?.find(rule => rule.rule_type === 'cooling_off');
        const sameDirectionRule = subRules?.find(rule => rule.rule_type === 'same_direction_guard');
        const maxActiveRule = subRules?.find(rule => rule.rule_type === 'max_active_trades');
        const positivePipRule = subRules?.find(rule => rule.rule_type === 'positive_pip_cancel_limit');
        
        const completeRuleSet: CompleteRuleSet = {
          id: ruleSet.id,
          name: ruleSet.name,
          description: ruleSet.description,
          markets: ruleSet.markets,
          is_active: ruleSet.is_active,
          created_at: ruleSet.created_at,
          updated_at: ruleSet.updated_at,
          created_by: ruleSet.created_by,
          enabledRules,
          breaches24h: 0, // TODO: Calculate from breach_events table
          status: ruleSet.is_active,
          coolingOff: (coolingOffRule?.configuration as any) || { 
            enabled: false, 
            tiers: [{ threshold: 2, window: 12, coolOff: 24 }], 
            metric: 'SLCount' 
          },
          sameDirectionGuard: (sameDirectionRule?.configuration as any) || { 
            enabled: false, 
            pairScope: 'All', 
            directions: { long: true, short: true } 
          },
          maxActiveTrades: (maxActiveRule?.configuration as any) || { 
            enabled: false, 
            baseCap: 10, 
            incrementPerWin: 1, 
            hardCap: null, 
            resetPolicy: 'Never' 
          },
          positivePipCancelLimit: (positivePipRule?.configuration as any) || { 
            enabled: false, 
            plBand: { from: 0, to: 10 }, 
            minHoldTime: 5, 
            maxCancels: 2, 
            window: 'UTCDay', 
            suspensionDuration: 24 
          }
        };
        
        return completeRuleSet;
      });
      
      const completeRuleSets = await Promise.all(ruleSetPromises);
      console.log('Complete rule sets:', completeRuleSets);
      setRuleSets(completeRuleSets);
      
    } catch (error) {
      console.error('Error loading rule sets:', error);
      toast.error('Failed to load rule sets');
    } finally {
      setIsLoading(false);
    }
  };
  
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
  
  const handleDuplicate = async (id: string) => {
    const ruleSetToDuplicate = ruleSets.find(rs => rs.id === id);
    
    if (ruleSetToDuplicate) {
      try {
        // Create new rule set with modified name
        const newRuleSetData = {
          name: `${ruleSetToDuplicate.name} (copy)`,
          description: ruleSetToDuplicate.description,
          markets: ruleSetToDuplicate.markets,
          is_active: ruleSetToDuplicate.is_active
        };
        
        const { data: newRuleSet, error: ruleSetError } = await supabase
          .from('rule_sets')
          .insert(newRuleSetData)
          .select()
          .single();
        
        if (ruleSetError) throw ruleSetError;
        
        // Copy sub-rules
        const { data: originalSubRules } = await supabase
          .from('sub_rules')
          .select('*')
          .eq('rule_set_id', id);
        
        if (originalSubRules && originalSubRules.length > 0) {
          const newSubRules = originalSubRules.map(rule => ({
            rule_set_id: newRuleSet.id,
            rule_type: rule.rule_type,
            is_enabled: rule.is_enabled,
            configuration: rule.configuration
          }));
          
          const { error: subRulesError } = await supabase
            .from('sub_rules')
            .insert(newSubRules);
          
          if (subRulesError) throw subRulesError;
        }
        
        toast.success(`Rule Set "${ruleSetToDuplicate.name}" duplicated successfully`);
        loadRuleSets(); // Reload the list
        
      } catch (error) {
        console.error('Error duplicating rule set:', error);
        toast.error('Failed to duplicate rule set');
      }
    }
  };
  
  const handleDelete = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const { error } = await deleteRuleSet(id);
        if (error) throw error;
      }
      
      toast.success(`${ids.length} rule set(s) deleted successfully`);
      loadRuleSets(); // Reload the list
      
    } catch (error) {
      console.error('Error deleting rule sets:', error);
      toast.error('Failed to delete rule sets');
    }
  };
  
  const handleStatusChange = async (id: string, enabled: boolean) => {
    try {
      const { error } = await updateRuleSet(id, { is_active: enabled });
      
      if (error) throw error;
      
      // Update local state
      setRuleSets(prev => 
        prev.map(rs => 
          rs.id === id 
            ? { ...rs, status: enabled, is_active: enabled, updated_at: new Date().toISOString() } 
            : rs
        )
      );
      
    } catch (error) {
      console.error('Error updating rule set status:', error);
      toast.error('Failed to update rule set status');
    }
  };
  
  const handleMarketChange = (market: Market | 'All') => {
    setSelectedMarket(market);
  };
  
  const handleStatusFilterChange = (status: RuleStatus) => {
    setSelectedStatus(status);
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
