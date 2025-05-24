
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RuleType } from '@/types/breach';

interface RuleTypeFilterProps {
  selectedRuleTypes: RuleType[];
  onRuleTypeChange: (ruleTypes: RuleType[]) => void;
}

const RULE_TYPE_OPTIONS: { value: RuleType; label: string; description: string }[] = [
  { value: 'CO', label: 'CO', description: 'Cooling-Off' },
  { value: 'GD', label: 'GD', description: 'Guard' },
  { value: 'AC', label: 'AC', description: 'Active-Cap' },
  { value: 'PC', label: 'PC', description: 'Positive-Cancel' },
];

const RuleTypeFilter: React.FC<RuleTypeFilterProps> = ({
  selectedRuleTypes,
  onRuleTypeChange
}) => {
  const handleValueChange = (values: string[]) => {
    onRuleTypeChange(values as RuleType[]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rule Type:</span>
        {selectedRuleTypes.length === 0 && (
          <span className="text-xs text-muted-foreground">All types</span>
        )}
      </div>
      <ToggleGroup
        type="multiple"
        value={selectedRuleTypes}
        onValueChange={handleValueChange}
        className="justify-start gap-1"
      >
        {RULE_TYPE_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.description}
            className="h-6 px-3 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default RuleTypeFilter;
