
import React from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateNew: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateNew }) => {
  return (
    <div className="text-center py-10">
      <div className="flex flex-col items-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <Shield className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mb-2">No Rule Sets yet</p>
        <Button onClick={onCreateNew}>
          New Rule Set
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
