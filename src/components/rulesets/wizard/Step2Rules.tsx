
import React from 'react';
import { Market } from '@/types';
import { useRuleWizardState } from '@/hooks/useRuleWizardState';
import RuleAccordionSection from './RuleAccordionSection';
import WizardActionButtons from './WizardActionButtons';
import RuleSummarySidebar from './RuleSummarySidebar';

import {
  CoolingOffRule as CoolingOffRuleType,
  SameDirectionGuardRule as SameDirectionGuardRuleType,
  MaxActiveTradesRule as MaxActiveTradesRuleType,
  PositivePipCancelLimitRule as PositivePipCancelLimitRuleType
} from '@/types';

interface Step2RulesProps {
  initialData?: {
    coolingOff?: CoolingOffRuleType;
    sameDirectionGuard?: SameDirectionGuardRuleType;
    maxActiveTrades?: MaxActiveTradesRuleType;
    positivePipCancelLimit?: PositivePipCancelLimitRuleType;
  };
  selectedMarket?: Market;
  onBack: () => void;
  onSave: (data: {
    coolingOff: CoolingOffRuleType;
    sameDirectionGuard: SameDirectionGuardRuleType;
    maxActiveTrades: MaxActiveTradesRuleType;
    positivePipCancelLimit: PositivePipCancelLimitRuleType;
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

const Step2Rules: React.FC<Step2RulesProps> = ({ 
  initialData, 
  selectedMarket,
  onBack, 
  onSave, 
  onCancel,
  isEditing = false,
  isLoading = false
}) => {
  const {
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
  } = useRuleWizardState({ initialData });
  
  const handleSave = () => {
    onSave(getRuleData());
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <RuleAccordionSection
          coolingOff={coolingOff}
          setCoolingOff={setCoolingOff}
          sameDirectionGuard={sameDirectionGuard}
          setSameDirectionGuard={setSameDirectionGuard}
          maxActiveTrades={maxActiveTrades}
          setMaxActiveTrades={setMaxActiveTrades}
          positivePipCancelLimit={positivePipCancelLimit}
          setPositivePipCancelLimit={setPositivePipCancelLimit}
          selectedMarket={selectedMarket}
        />
        
        <WizardActionButtons
          onBack={onBack}
          onCancel={onCancel}
          onSave={handleSave}
          isAnyRuleEnabled={isAnyRuleEnabled}
          isLoading={isLoading}
          isEditing={isEditing}
        />
      </div>
      
      <RuleSummarySidebar
        coolingOff={coolingOff}
        sameDirectionGuard={sameDirectionGuard}
        maxActiveTrades={maxActiveTrades}
        positivePipCancelLimit={positivePipCancelLimit}
      />
    </div>
  );
};

export default Step2Rules;
