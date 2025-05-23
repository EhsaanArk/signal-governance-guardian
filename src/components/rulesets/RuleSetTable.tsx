
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2,
  Check,
  AlertTriangle,
  Infinity,
  Ban,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

import StatusToggle from '../common/StatusToggle';
import MarketChip from '../common/MarketChip';
import BreachBadge from '../common/BreachBadge';
import { CompleteRuleSet } from '@/types';

interface RuleSetTableProps {
  ruleSets: CompleteRuleSet[];
  onDuplicate: (id: string) => void;
  onDelete: (ids: string[]) => void;
  onStatusChange: (id: string, enabled: boolean) => void;
}

const RuleSetTable: React.FC<RuleSetTableProps> = ({ 
  ruleSets, 
  onDuplicate,
  onDelete,
  onStatusChange
}) => {
  const navigate = useNavigate();
  const [selectedRuleSets, setSelectedRuleSets] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  
  const handleRowClick = (id: string) => {
    navigate(`/admin/rulesets/${id}`);
  };
  
  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/rulesets/${id}/edit`);
  };
  
  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(id);
  };
  
  const handleDeleteDialog = (ids: string[], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteIds(ids);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    onDelete(deleteIds);
    setSelectedRuleSets(prev => prev.filter(id => !deleteIds.includes(id)));
    setDeleteDialogOpen(false);
    toast.success(`${deleteIds.length} rule set(s) deleted successfully`);
  };
  
  const handleSelectAll = (checked: boolean) => {
    setSelectedRuleSets(checked ? ruleSets.map(rs => rs.id) : []);
  };
  
  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRuleSets(prev => 
      checked 
        ? [...prev, id] 
        : prev.filter(itemId => itemId !== id)
    );
  };
  
  const handleBulkEnable = (enable: boolean) => {
    selectedRuleSets.forEach(id => onStatusChange(id, enable));
    toast.success(`${selectedRuleSets.length} rule set(s) ${enable ? 'enabled' : 'disabled'}`);
    setSelectedRuleSets([]);
  };

  const renderRuleIcons = (ruleSet: CompleteRuleSet) => {
    return (
      <div className="flex space-x-2">
        {/* ① Cooling-Off ⚠ */}
        <AlertTriangle 
          className={`h-5 w-5 ${ruleSet.enabledRules.coolingOff ? 'text-warning' : 'text-gray-300'}`} 
        />
        {/* ② Guard ⛔ */}
        <Ban 
          className={`h-5 w-5 ${ruleSet.enabledRules.sameDirectionGuard ? 'text-primary' : 'text-gray-300'}`} 
        />
        {/* ③ Active-Cap ∞ */}
        <Infinity 
          className={`h-5 w-5 ${ruleSet.enabledRules.maxActiveTrades ? 'text-secondary' : 'text-gray-300'}`} 
        />
        {/* ④ Cancel-Limit ✔ */}
        <Check 
          className={`h-5 w-5 ${ruleSet.enabledRules.positivePipCancelLimit ? 'text-success' : 'text-gray-300'}`} 
        />
      </div>
    );
  };
  
  const showBulkActions = selectedRuleSets.length > 0;
  
  return (
    <>
      <div className="table-container">
        {showBulkActions && (
          <div className="sticky top-16 z-20 flex items-center justify-between bg-muted/20 p-2 border-b">
            <div className="text-sm">
              Selected <span className="font-medium">{selectedRuleSets.length}</span> rule sets
            </div>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkEnable(true)}
              >
                Enable
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkEnable(false)}
              >
                Disable
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={(e) => handleDeleteDialog(selectedRuleSets, e)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
        
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="nuroblock-table">
            <thead className="sticky top-16 bg-background z-10">
              <tr>
                <th className="w-[5%]">
                  <Checkbox 
                    onCheckedChange={(checked) => handleSelectAll(!!checked)} 
                    checked={selectedRuleSets.length === ruleSets.length && ruleSets.length > 0}
                    aria-label="Select all rule sets"
                  />
                </th>
                <th className="w-[22%]">Name</th>
                <th className="w-[18%]">Markets</th>
                <th className="w-[22%]">Enabled Rules</th>
                <th className="w-[10%]">Breaches 24h</th>
                <th className="w-[8%]">Status</th>
                <th className="w-[5%]"></th>
              </tr>
            </thead>
            <tbody>
              {ruleSets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Shield className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="mb-2">No Rule Sets yet</p>
                      <Button 
                        onClick={() => navigate('/admin/rulesets/create')}
                      >
                        New Rule Set
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                ruleSets.map((ruleSet) => (
                  <tr 
                    key={ruleSet.id} 
                    onClick={() => handleRowClick(ruleSet.id)}
                    className="cursor-pointer hover:bg-muted/30"
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedRuleSets.includes(ruleSet.id)}
                        onCheckedChange={(checked) => handleSelectRow(ruleSet.id, !!checked)}
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
                    <td>{renderRuleIcons(ruleSet)}</td>
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
                          <DropdownMenuItem onClick={(e) => handleEdit(ruleSet.id, e)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDuplicate(ruleSet.id, e)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleDeleteDialog([ruleSet.id], e)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4 p-4">
          {ruleSets.length === 0 ? (
            <div className="text-center py-10">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Shield className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mb-2">No Rule Sets yet</p>
                <Button 
                  onClick={() => navigate('/admin/rulesets/create')}
                >
                  New Rule Set
                </Button>
              </div>
            </div>
          ) : (
            ruleSets.map((ruleSet) => (
              <div 
                key={ruleSet.id}
                className="bg-card border rounded-lg p-4 space-y-3"
                onClick={() => handleRowClick(ruleSet.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={selectedRuleSets.includes(ruleSet.id)}
                      onCheckedChange={(checked) => handleSelectRow(ruleSet.id, !!checked)}
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
                      <DropdownMenuItem onClick={(e) => handleEdit(ruleSet.id, e)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleDuplicate(ruleSet.id, e)}>
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Duplicate</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => handleDeleteDialog([ruleSet.id], e)}
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
                      {renderRuleIcons(ruleSet)}
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
            ))
          )}
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteIds.length === 1 ? 'this rule set' : 'these rule sets'}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogFooter>
      </div>
    </>
  );
};

export default RuleSetTable;
