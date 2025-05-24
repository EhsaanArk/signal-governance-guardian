
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterClearButtonProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const FilterClearButton: React.FC<FilterClearButtonProps> = ({
  hasActiveFilters,
  onClearFilters
}) => {
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClearFilters}
      className="h-10 px-3 text-muted-foreground hover:text-foreground"
      aria-label="Clear all filters"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Clear filters</span>
    </Button>
  );
};

export default FilterClearButton;
