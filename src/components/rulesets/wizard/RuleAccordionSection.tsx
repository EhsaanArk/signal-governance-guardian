
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from '@/components/ui/switch';

import CoolingOffRule from './rules/CoolingOffRule';
import SameDirectionGuardRule from './rules/SameDirectionGuardRule';
import MaxActiveTradesRule from './rules/MaxActiveTradesRule';
import PositivePipCancelRule from './rules/PositivePipCancelRule';

import {
  Market,
  CoolingOffRule as CoolingOffRuleType,
  SameDirectionGuardRule as SameDirectionGuardRuleType,
  MaxActiveTradesRule as MaxActiveTradesRuleType,
  PositivePipCancelLimitRule as PositivePipCancelLimitRuleType
} from '@/types';

interface RuleAccordionSectionProps {
  coolingOff: CoolingOffRuleType;
  setCoolingOff: (value: CoolingOffRuleType) => void;
  sameDirectionGuard: SameDirectionGuardRuleType;
  setSameDirectionGuard: (value: SameDirectionGuardRuleType) => void;
  maxActiveTrades: MaxActiveTradesRuleType;
  setMaxActiveTrades: (value: MaxActiveTradesRuleType) => void;
  positivePipCancelLimit: PositivePipCancelLimitRuleType;
  setPositivePipCancelLimit: (value: PositivePipCancelLimitRuleType) => void;
  selectedMarket?: Market;
}

const RuleAccordionSection: React.FC<RuleAccordionSectionProps> = ({
  coolingOff,
  setCoolingOff,
  sameDirectionGuard,
  setSameDirectionGuard,
  maxActiveTrades,
  setMaxActiveTrades,
  positivePipCancelLimit,
  setPositivePipCancelLimit,
  selectedMarket
}) => {
  return (
    <Accordion type="multiple" defaultValue={["cooling-off"]} className="w-full">
      <AccordionItem value="cooling-off">
        <AccordionTrigger className="flex justify-between">
          <div className="flex items-center gap-4">
            <span>Cooling-Off (SL-based)</span>
            <Switch
              checked={coolingOff.enabled}
              onCheckedChange={(checked) => {
                setCoolingOff(prev => ({ ...prev, enabled: checked }));
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CoolingOffRule 
            value={coolingOff} 
            onChange={setCoolingOff}
            disabled={!coolingOff.enabled}
          />
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="same-direction">
        <AccordionTrigger className="flex justify-between">
          <div className="flex items-center gap-4">
            <span>Same-Direction Guard</span>
            <Switch
              checked={sameDirectionGuard.enabled}
              onCheckedChange={(checked) => {
                setSameDirectionGuard(prev => ({ ...prev, enabled: checked }));
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <SameDirectionGuardRule 
            value={sameDirectionGuard} 
            onChange={setSameDirectionGuard}
            disabled={!sameDirectionGuard.enabled}
            selectedMarket={selectedMarket}
          />
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="max-active">
        <AccordionTrigger className="flex justify-between">
          <div className="flex items-center gap-4">
            <span>Max Active Trades</span>
            <Switch
              checked={maxActiveTrades.enabled}
              onCheckedChange={(checked) => {
                setMaxActiveTrades(prev => ({ ...prev, enabled: checked }));
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <MaxActiveTradesRule 
            value={maxActiveTrades} 
            onChange={setMaxActiveTrades}
            disabled={!maxActiveTrades.enabled}
          />
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="positive-pip">
        <AccordionTrigger className="flex justify-between">
          <div className="flex items-center gap-4">
            <span>Positive-Pip Cancel-Limit</span>
            <Switch
              checked={positivePipCancelLimit.enabled}
              onCheckedChange={(checked) => {
                setPositivePipCancelLimit(prev => ({ ...prev, enabled: checked }));
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <PositivePipCancelRule 
            value={positivePipCancelLimit} 
            onChange={setPositivePipCancelLimit}
            disabled={!positivePipCancelLimit.enabled}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default RuleAccordionSection;
