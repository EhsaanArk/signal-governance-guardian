
import { useState } from 'react';
import {
  CoolingOffRule,
  SameDirectionGuardRule,
  MaxActiveTradesRule,
  PositivePipCancelLimitRule
} from '@/types';

interface UseRuleWizardStateProps {
  initialData?: {
    coolingOff?: CoolingOffRule;
    sameDirectionGuard?: SameDirectionGuardRule;
    maxActiveTrades?: MaxActiveTradesRule;
    positivePipCancelLimit?: PositivePipCancelLimitRule;
  };
}

export const useRuleWizardState = ({ initialData }: UseRuleWizardStateProps = {}) => {
  const [coolingOff, setCoolingOff] = useState<CoolingOffRule>(
    initialData?.coolingOff || {
      enabled: false,
      tiers: [{ threshold: 2, window: 12, coolOff: 24 }],
      metric: 'SLCount',
    }
  );
  
  const [sameDirectionGuard, setSameDirectionGuard] = useState<SameDirectionGuardRule>(
    initialData?.sameDirectionGuard || {
      enabled: false,
      pairScope: 'All',
      directions: { long: true, short: true },
      selectedPairs: [],
    }
  );
  
  const [maxActiveTrades, setMaxActiveTrades] = useState<MaxActiveTradesRule>(
    initialData?.maxActiveTrades || {
      enabled: false,
      baseCap: 10,
      incrementPerWin: 1,
      hardCap: null,
      resetPolicy: 'Never',
    }
  );
  
  const [positivePipCancelLimit, setPositivePipCancelLimit] = useState<PositivePipCancelLimitRule>(
    initialData?.positivePipCancelLimit || {
      enabled: false,
      plBand: { from: 0, to: 10 },
      minHoldTime: 5,
      maxCancels: 2,
      window: 'UTCDay',
      suspensionDuration: 24,
    }
  );
  
  // Check if at least one rule is enabled for save button status
  const isAnyRuleEnabled = 
    coolingOff.enabled || 
    sameDirectionGuard.enabled || 
    maxActiveTrades.enabled || 
    positivePipCancelLimit.enabled;
  
  const getRuleData = () => ({
    coolingOff,
    sameDirectionGuard,
    maxActiveTrades,
    positivePipCancelLimit
  });
  
  return {
    coolingOff,
    setCoolingOff,
    sameDirectionGuard,
    setSameDirectionGuard,
    maxActiveTrades,
    setMaxActiveTrades,
    positivePipCancelLimit,
    setPositivePipCancelLimit,
    isAnyRuleEnabled,
    getRuleData
  };
};
