
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilteredProviderIndicatorProps {
  providerName: string;
  onClear: () => void;
}

const FilteredProviderIndicator: React.FC<FilteredProviderIndicatorProps> = ({
  providerName,
  onClear,
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Badge variant="secondary" className="flex items-center gap-2 py-1 px-3">
        <span className="text-sm">Filtered by Provider: {providerName}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={onClear}
          aria-label="Clear provider filter"
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    </div>
  );
};

export default FilteredProviderIndicator;
