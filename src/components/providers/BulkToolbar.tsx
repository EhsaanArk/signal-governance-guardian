
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BulkToolbarProps {
  selectedCount: number;
  selectedProviders: any[];
  onSuspend: () => void;
  onReinstate: () => void;
  onAssignRuleSets: () => void;
  onClearSelection: () => void;
}

const BulkToolbar: React.FC<BulkToolbarProps> = ({
  selectedCount,
  selectedProviders,
  onSuspend,
  onReinstate,
  onAssignRuleSets,
  onClearSelection
}) => {
  if (selectedCount === 0) return null;

  // Determine button states based on selected providers' statuses
  const activeCount = selectedProviders.filter(p => p.status === 'Active').length;
  const suspendedCount = selectedProviders.filter(p => p.status === 'Suspended').length;
  
  const canSuspend = activeCount > 0;
  const canReinstate = suspendedCount > 0;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t z-50 animate-slide-in-up"
      role="region"
      aria-label="Bulk actions"
      style={{ height: '56px' }}
    >
      <div className="flex items-center justify-between h-full px-4 max-w-full">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {selectedCount} selected
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={onSuspend}
              disabled={!canSuspend}
              className="bg-red-600 hover:bg-red-700"
            >
              Suspend
            </Button>
            
            <Button
              size="sm"
              onClick={onReinstate}
              disabled={!canReinstate}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Reinstate
            </Button>
            
            <Button
              size="sm"
              onClick={onAssignRuleSets}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Assign Rule-Set
            </Button>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear Selection
          <X className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {/* Mobile responsive version */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-md border-t z-50 p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={onSuspend}
              disabled={!canSuspend}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Suspend
            </Button>
            
            <Button
              size="sm"
              onClick={onReinstate}
              disabled={!canReinstate}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Reinstate
            </Button>
            
            <Button
              size="sm"
              onClick={onAssignRuleSets}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Assign Rule-Set
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkToolbar;
