
import React from 'react';
import { MoreHorizontal, Edit, Copy, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import StatusToggle from '../common/StatusToggle';
import MarketChip from '../common/MarketChip';
import BreachBadge from '../common/BreachBadge';
import RuleIconsDisplay from './RuleIconsDisplay';
import { CompleteRuleSet } from '@/types';

interface RuleSetMobileCardProps {
  ruleSet: CompleteRuleSet;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onRowClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onStatusChange: (id: string, enabled: boolean) => void;
}

const RuleSetMobileCard: React.FC<RuleSetMobileCardProps> = ({
  ruleSet,
  isSelected,
  onSelect,
  onRowClick,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange
}) => {
  return (
    <div 
      className="bg-card border rounded-lg p-4 space-y-3"
      onClick={onRowClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${ruleSet.name}`}
          />
          <div>
            <h3 className="font-medium">{ruleSet.name}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {ruleSet.markets.map((market) => (
                <MarketChip key={market} market={market} />
              ))}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Rules:</span>
            <RuleIconsDisplay ruleSet={ruleSet} />
          </div>
          <BreachBadge count={ruleSet.breaches24h} />
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <StatusToggle 
            id={ruleSet.id} 
            name={ruleSet.name}
            enabled={ruleSet.status} 
            onToggle={onStatusChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default RuleSetMobileCard;
