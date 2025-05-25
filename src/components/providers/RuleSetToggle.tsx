
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface RuleSetToggleProps {
  name: string;
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}

const RuleSetToggle: React.FC<RuleSetToggleProps> = ({
  name,
  isEnabled,
  onToggle
}) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-md border">
      <span className="text-sm font-medium">{name}</span>
      <Switch
        checked={isEnabled}
        onCheckedChange={onToggle}
      />
    </div>
  );
};

export default RuleSetToggle;
