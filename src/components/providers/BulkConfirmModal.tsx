
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Provider } from '@/types/provider';

interface BulkConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'suspend' | 'reinstate';
  providers: Provider[];
}

const BulkConfirmModal: React.FC<BulkConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  providers
}) => {
  const actionText = action === 'suspend' ? 'Suspend' : 'Reinstate';
  const actionTextLower = action === 'suspend' ? 'suspend' : 'reinstate';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionText} {providers.length} provider{providers.length > 1 ? 's' : ''}?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            You are about to {actionTextLower} the following provider{providers.length > 1 ? 's' : ''}:
          </p>
          
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {providers.map((provider) => (
              <li key={provider.id} className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                {provider.provider_name}
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            variant={action === 'suspend' ? 'destructive' : 'default'}
            className={action === 'reinstate' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
          >
            {actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkConfirmModal;
