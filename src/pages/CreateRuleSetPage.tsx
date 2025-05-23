
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Step1Basics from '@/components/rulesets/wizard/Step1Basics';
import Step2Rules from '@/components/rulesets/wizard/Step2Rules';

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
  
  const handleStep2Save = (data: {
    coolingOff: CoolingOffRule;
    sameDirectionGuard: SameDirectionGuardRule;
    maxActiveTrades: MaxActiveTradesRule;
    positivePipCancelLimit: PositivePipCancelLimitRule;
  }) => {
    setCoolingOff(data.coolingOff);
    setSameDirectionGuard(data.sameDirectionGuard);
    setMaxActiveTrades(data.maxActiveTrades);
    setPositivePipCancelLimit(data.positivePipCancelLimit);
    
    // Save rule set logic would go here in a real application
    toast.success('Rule Set created successfully');
    navigate('/admin/rulesets');
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
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateRuleSetPage;
