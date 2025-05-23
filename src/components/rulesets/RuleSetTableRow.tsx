
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

interface RuleSetTableRowProps {
  ruleSet: CompleteRuleSet;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onRowClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onStatusChange: (id: string, enabled: boolean) => void;
}

const RuleSetTableRow: React.FC<RuleSetTableRowProps> = ({
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
    <tr 
      onClick={onRowClick}
      className="cursor-pointer hover:bg-muted/30"
    >
      <td onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select ${ruleSet.name}`}
        />
      </td>
      <td className="font-medium">{ruleSet.name}</td>
      <td>
        <div className="flex flex-wrap gap-1">
          {ruleSet.markets.map((market) => (
            <MarketChip key={market} market={market} />
          ))}
        </div>
      </td>
      <td>
        <RuleIconsDisplay ruleSet={ruleSet} />
      </td>
      <td>
        <BreachBadge count={ruleSet.breaches24h} />
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <StatusToggle 
          id={ruleSet.id} 
          name={ruleSet.name}
          enabled={ruleSet.status} 
          onToggle={onStatusChange} 
        />
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
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
      </td>
    </tr>
  );
};

export default RuleSetTableRow;
