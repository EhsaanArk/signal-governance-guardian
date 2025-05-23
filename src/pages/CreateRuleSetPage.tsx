
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Step1Basics from '@/components/rulesets/wizard/Step1Basics';
import Step2Rules from '@/components/rulesets/wizard/Step2Rules';

import { createRuleSet } from '@/lib/api/rule-sets';
import { supabase } from '@/integrations/supabase/client';

import {
  Market, 
  CoolingOffRule, 
  SameDirectionGuardRule, 
  MaxActiveTradesRule, 
  PositivePipCancelLimitRule
} from '@/types';

const CreateRuleSetPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1 data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [markets, setMarkets] = useState<Market[]>([]);
  
  // Step 2 data
  const [coolingOff, setCoolingOff] = useState<CoolingOffRule>({
    enabled: false,
    tiers: [{ threshold: 2, window: 12, coolOff: 24 }],
    metric: 'SLCount',
  });
  
  const [sameDirectionGuard, setSameDirectionGuard] = useState<SameDirectionGuardRule>({
    enabled: false,
    pairScope: 'All',
    directions: { long: true, short: true },
  });
  
  const [maxActiveTrades, setMaxActiveTrades] = useState<MaxActiveTradesRule>({
    enabled: false,
    baseCap: 10,
    incrementPerWin: 1,
    hardCap: null,
    resetPolicy: 'Never',
  });
  
  const [positivePipCancelLimit, setPositivePipCancelLimit] = useState<PositivePipCancelLimitRule>({
    enabled: false,
    plBand: { from: 0, to: 10 },
    minHoldTime: 5,
    maxCancels: 2,
    window: 'UTCDay',
    suspensionDuration: 24,
  });
  
  const handleStep1Next = (data: { name: string; description?: string; markets: Market[] }) => {
    setName(data.name);
    setDescription(data.description || '');
    setMarkets(data.markets);
    setCurrentStep(2);
  };
  
  const handleStep2Save = async (data: {
    coolingOff: CoolingOffRule;
    sameDirectionGuard: SameDirectionGuardRule;
    maxActiveTrades: MaxActiveTradesRule;
    positivePipCancelLimit: PositivePipCancelLimitRule;
  }) => {
    setIsLoading(true);
    
    try {
      // Create the rule set first
      const ruleSetData = {
        name,
        description,
        markets,
        is_active: true
      };
      
      console.log('Creating rule set with data:', ruleSetData);
      const { data: createdRuleSet, error: ruleSetError } = await createRuleSet(ruleSetData);
      
      if (ruleSetError) {
        console.error('Error creating rule set:', ruleSetError);
        throw new Error(ruleSetError.message || 'Failed to create rule set');
      }
      
      if (!createdRuleSet) {
        throw new Error('No rule set data returned');
      }
      
      console.log('Rule set created successfully:', createdRuleSet);
      
      // Create sub-rules for each enabled rule
      const subRulesToCreate = [];
      
      if (data.coolingOff.enabled) {
        subRulesToCreate.push({
          rule_set_id: createdRuleSet.id,
          rule_type: 'cooling_off',
          is_enabled: true,
          configuration: data.coolingOff
        });
      }
      
      if (data.sameDirectionGuard.enabled) {
        subRulesToCreate.push({
          rule_set_id: createdRuleSet.id,
          rule_type: 'same_direction_guard',
          is_enabled: true,
          configuration: data.sameDirectionGuard
        });
      }
      
      if (data.maxActiveTrades.enabled) {
        subRulesToCreate.push({
          rule_set_id: createdRuleSet.id,
          rule_type: 'max_active_trades',
          is_enabled: true,
          configuration: data.maxActiveTrades
        });
      }
      
      if (data.positivePipCancelLimit.enabled) {
        subRulesToCreate.push({
          rule_set_id: createdRuleSet.id,
          rule_type: 'positive_pip_cancel_limit',
          is_enabled: true,
          configuration: data.positivePipCancelLimit
        });
      }
      
      // Insert sub-rules if any are enabled
      if (subRulesToCreate.length > 0) {
        console.log('Creating sub-rules:', subRulesToCreate);
        const { error: subRulesError } = await supabase
          .from('sub_rules')
          .insert(subRulesToCreate);
        
        if (subRulesError) {
          console.error('Error creating sub-rules:', subRulesError);
          throw new Error(subRulesError.message || 'Failed to create sub-rules');
        }
        
        console.log('Sub-rules created successfully');
      }
      
      toast.success('Rule Set created successfully');
      navigate('/admin/rulesets');
      
    } catch (error) {
      console.error('Error saving rule set:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create rule set');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/rulesets');
  };
  
  return (
    <MainLayout>
      <Header 
        title="Create Rule Set"
        subtitle={`Step ${currentStep} of 2: ${currentStep === 1 ? 'Basics & Scope' : 'Configure Sub-Rules'}`}
      />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 ? (
            <Step1Basics
              onNext={handleStep1Next}
              onCancel={handleCancel}
            />
          ) : (
            <Step2Rules
              onBack={() => setCurrentStep(1)}
              onSave={handleStep2Save}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateRuleSetPage;
