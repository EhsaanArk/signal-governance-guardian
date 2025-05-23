
import React from 'react';
import { Button } from '@/components/ui/button';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkEnable: (enable: boolean) => void;
  onBulkDelete: () => void;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onBulkEnable,
  onBulkDelete
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-16 z-20 flex items-center justify-between bg-muted/20 p-2 border-b">
      <div className="text-sm">
        Selected <span className="font-medium">{selectedCount}</span> rule sets
      </div>
      <div className="space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onBulkEnable(true)}
        >
          Enable
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onBulkEnable(false)}
        >
          Disable
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onBulkDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;
