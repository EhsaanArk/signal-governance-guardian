
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface StatusToggleProps {
  id: string;
  name: string;
  enabled: boolean;
  onToggle: (id: string, enabled: boolean) => void;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ id, name, enabled, onToggle }) => {
  const handleToggle = (newState: boolean) => {
    onToggle(id, newState);
    
    toast(`Rule-Set '${name}' ${newState ? 'enabled' : 'disabled'} — `, {
      action: {
        label: 'Undo',
        onClick: () => onToggle(id, !newState),
      },
    });
  };

  return (
    <Switch 
      checked={enabled}
      onCheckedChange={handleToggle}
      aria-label={`Toggle ${name} status`}
      className="data-[state=checked]:bg-green-500"
    />
  );
};

export default StatusToggle;
