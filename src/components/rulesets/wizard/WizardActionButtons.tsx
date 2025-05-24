
import React from 'react';
import { Button } from '@/components/ui/button';

interface WizardActionButtonsProps {
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
  isAnyRuleEnabled: boolean;
  isLoading?: boolean;
  isEditing?: boolean;
}

const WizardActionButtons: React.FC<WizardActionButtonsProps> = ({
  onBack,
  onCancel,
  onSave,
  isAnyRuleEnabled,
  isLoading = false,
  isEditing = false
}) => {
  return (
    <div className="flex justify-between mt-8">
      <Button variant="outline" onClick={onBack} disabled={isLoading}>
        ← Back
      </Button>
      <div className="space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={onSave} 
          disabled={!isAnyRuleEnabled || isLoading}
        >
          {isLoading ? 'Creating...' : (isEditing ? 'Save Rule Set' : 'Create Rule Set')}
        </Button>
      </div>
    </div>
  );
};

export default WizardActionButtons;
