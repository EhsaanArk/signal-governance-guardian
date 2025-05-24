
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface PairSelectorProps {
  pairs: string[];
  selectedPairs: string[];
  onChange: (selectedPairs: string[]) => void;
  disabled?: boolean;
}

const PairSelector: React.FC<PairSelectorProps> = ({ 
  pairs, 
  selectedPairs, 
  onChange, 
  disabled = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPairs = pairs.filter(pair =>
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePairToggle = (pair: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedPairs, pair]);
    } else {
      onChange(selectedPairs.filter(p => p !== pair));
    }
  };

  const handleSelectAll = () => {
    onChange(filteredPairs);
  };

  const handleDeselectAll = () => {
    const remainingPairs = selectedPairs.filter(pair => !filteredPairs.includes(pair));
    onChange(remainingPairs);
  };

  const isAllSelected = filteredPairs.length > 0 && filteredPairs.every(pair => selectedPairs.includes(pair));
  const isSomeSelected = filteredPairs.some(pair => selectedPairs.includes(pair));

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search pairs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={isAllSelected}
          >
            Select All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={!isSomeSelected}
          >
            Deselect All
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {selectedPairs.length} of {pairs.length} pairs selected
      </div>

      <ScrollArea className="h-48 w-full border rounded-md p-4">
        <div className="grid grid-cols-2 gap-2">
          {filteredPairs.map((pair) => (
            <div key={pair} className="flex items-center space-x-2">
              <Checkbox
                id={`pair-${pair}`}
                checked={selectedPairs.includes(pair)}
                onCheckedChange={(checked) => handlePairToggle(pair, !!checked)}
              />
              <Label
                htmlFor={`pair-${pair}`}
                className="text-sm font-normal cursor-pointer"
              >
                {pair}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PairSelector;
