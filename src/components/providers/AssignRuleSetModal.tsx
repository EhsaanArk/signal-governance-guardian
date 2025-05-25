
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface RuleSet {
  id: string;
  name: string;
  description: string;
  markets: string[];
}

interface AssignRuleSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
}

const AssignRuleSetModal: React.FC<AssignRuleSetModalProps> = ({
  isOpen,
  onClose,
  providerName
}) => {
  const { toast } = useToast();
  const [selectedRuleSets, setSelectedRuleSets] = useState<string[]>([]);

  // Mock rule sets data
  const mockRuleSets: RuleSet[] = [
    {
      id: '1',
      name: 'Forex Standard Protection',
      description: 'Basic risk management for forex trading',
      markets: ['Forex']
    },
    {
      id: '2',
      name: 'Crypto HFT Trading',
      description: 'High-frequency trading rules for crypto',
      markets: ['Crypto']
    },
    {
      id: '3',
      name: 'Risk Management Core',
      description: 'Core risk management rules',
      markets: ['Forex', 'Crypto', 'Indices']
    },
    {
      id: '4',
      name: 'Conservative Trading',
      description: 'Conservative approach with strict limits',
      markets: ['Forex', 'Indices']
    },
    {
      id: '5',
      name: 'Aggressive Growth',
      description: 'Higher risk tolerance for growth',
      markets: ['Crypto']
    },
    {
      id: '6',
      name: 'Compliance Plus',
      description: 'Enhanced compliance monitoring',
      markets: ['Forex', 'Crypto', 'Indices']
    }
  ];

  const handleRuleSetToggle = (ruleSetId: string) => {
    setSelectedRuleSets(prev =>
      prev.includes(ruleSetId)
        ? prev.filter(id => id !== ruleSetId)
        : [...prev, ruleSetId]
    );
  };

  const handleSave = () => {
    const selectedNames = mockRuleSets
      .filter(rs => selectedRuleSets.includes(rs.id))
      .map(rs => rs.name);

    toast({
      title: "Rule-sets assigned (mock)",
      description: selectedNames.length > 0 
        ? `Assigned ${selectedNames.join(', ')} to ${providerName}`
        : `No rule-sets selected for ${providerName}`,
    });

    setSelectedRuleSets([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedRuleSets([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Rule-sets to {providerName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {mockRuleSets.map((ruleSet) => (
            <div key={ruleSet.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                id={ruleSet.id}
                checked={selectedRuleSets.includes(ruleSet.id)}
                onCheckedChange={() => handleRuleSetToggle(ruleSet.id)}
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={ruleSet.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {ruleSet.name}
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  {ruleSet.description}
                </p>
                <div className="flex gap-1 mt-2">
                  {ruleSet.markets.map(market => (
                    <span
                      key={market}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                    >
                      {market}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save ({selectedRuleSets.length} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignRuleSetModal;
