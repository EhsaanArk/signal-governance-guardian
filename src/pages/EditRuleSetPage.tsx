import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Step1Basics from '@/components/rulesets/wizard/Step1Basics';
import Step2Rules from '@/components/rulesets/wizard/Step2Rules';

import {
  Market, 
  CompleteRuleSet,
  CoolingOffRule, 
  SameDirectionGuardRule, 
  MaxActiveTradesRule, 
  PositivePipCancelLimitRule
} from '@/types';

// Mock data for a complete rule set with all rule details
const mockCompleteRuleSet: CompleteRuleSet = {
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
  
  // Rule details
  coolingOff: {
    enabled: true,
    tiers: [
      { threshold: 2, window: 6, coolOff: 12 },
      { threshold: 3, window: 12, coolOff: 24 }
    ],
    metric: 'SLCount'
  },
  
  sameDirectionGuard: {
    enabled: true,
    pairScope: 'All',
    directions: { long: true, short: false },
    selectedPairs: []
  },
  
  maxActiveTrades: {
    enabled: true,
    baseCap: 5,
    incrementPerWin: 2,
    hardCap: 15,
    resetPolicy: 'Monthly'
  },
  
  positivePipCancelLimit: {
    enabled: true,
    plBand: { from: 2, to: 15 },
    minHoldTime: 10,
    maxCancels: 3,
    window: 'UTCDay',
    suspensionDuration: 12
  }
};

const EditRuleSetPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ruleSet, setRuleSet] = useState<CompleteRuleSet | null>(null);
  
  useEffect(() => {
    // In a real app, this would be an API call to fetch the rule set
    setRuleSet(mockCompleteRuleSet);
    setLoading(false);
  }, [id]);
  
  const handleStep1Next = (data: { name: string; description?: string; markets: Market[] }) => {
    setRuleSet(prev => {
      if (!prev) return null;
      return {
        ...prev,
        name: data.name,
        description: data.description || '',
        markets: data.markets
      };
    });
    setCurrentStep(2);
  };
  
  const handleStep2Save = (data: {
    coolingOff: CoolingOffRule;
    sameDirectionGuard: SameDirectionGuardRule;
    maxActiveTrades: MaxActiveTradesRule;
    positivePipCancelLimit: PositivePipCancelLimitRule;
  }) => {
    setRuleSet(prev => {
      if (!prev) return null;
      return {
        ...prev,
        coolingOff: data.coolingOff,
        sameDirectionGuard: data.sameDirectionGuard,
        maxActiveTrades: data.maxActiveTrades,
        positivePipCancelLimit: data.positivePipCancelLimit,
        enabledRules: {
          coolingOff: data.coolingOff.enabled,
          sameDirectionGuard: data.sameDirectionGuard.enabled,
          maxActiveTrades: data.maxActiveTrades.enabled,
          positivePipCancelLimit: data.positivePipCancelLimit.enabled
        },
        updated_at: new Date().toISOString()
      };
    });
    
    // Save logic would go here in a real application
    toast.success('Rule Set updated successfully');
    navigate('/admin/rulesets');
  };
  
  const handleCancel = () => {
    navigate('/admin/rulesets');
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 flex justify-center">
          <p>Loading rule set...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!ruleSet) {
    return (
      <MainLayout>
        <div className="p-6 flex justify-center">
          <p>Rule set not found</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <Header 
        title={`Edit Rule Set: ${ruleSet?.name}`}
        subtitle={`Step ${currentStep} of 2: ${currentStep === 1 ? 'Basics & Scope' : 'Configure Sub-Rules'}`}
      />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 ? (
            <Step1Basics
              initialData={{
                name: ruleSet?.name,
                description: ruleSet?.description,
                markets: ruleSet?.markets
              }}
              onNext={handleStep1Next}
              onCancel={handleCancel}
            />
          ) : (
            <Step2Rules
              initialData={{
                coolingOff: ruleSet?.coolingOff as CoolingOffRule,
                sameDirectionGuard: ruleSet?.sameDirectionGuard as SameDirectionGuardRule,
                maxActiveTrades: ruleSet?.maxActiveTrades as MaxActiveTradesRule,
                positivePipCancelLimit: ruleSet?.positivePipCancelLimit as PositivePipCancelLimitRule
              }}
              selectedMarket={ruleSet?.markets[0]}
              isEditing={true}
              onBack={() => setCurrentStep(1)}
              onSave={handleStep2Save}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EditRuleSetPage;
