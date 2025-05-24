
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionType } from '@/types/breach';

interface ActionFilterProps {
  selectedActions: ActionType[];
  onActionChange: (actions: ActionType[]) => void;
}

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'paused', label: 'Paused' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

const ActionFilter: React.FC<ActionFilterProps> = ({
  selectedActions,
  onActionChange
}) => {
  const handleActionToggle = (actionValue: ActionType, checked: boolean) => {
    if (checked) {
      onActionChange([...selectedActions, actionValue]);
    } else {
      onActionChange(selectedActions.filter(action => action !== actionValue));
    }
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm text-muted-foreground">
        Filter by action
        {selectedActions.length === 0 && (
          <span className="ml-2 text-xs">All actions</span>
        )}
      </legend>
      <div className="flex flex-wrap gap-4">
        {ACTION_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`action-${option.value}`}
              checked={selectedActions.includes(option.value)}
              onCheckedChange={(checked) => 
                handleActionToggle(option.value, checked === true)
              }
            />
            <label
              htmlFor={`action-${option.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

export default ActionFilter;
