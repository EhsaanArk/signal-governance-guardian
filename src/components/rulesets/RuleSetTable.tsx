
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import BulkActionsToolbar from './BulkActionsToolbar';
import RuleSetTableRow from './RuleSetTableRow';
import RuleSetMobileCard from './RuleSetMobileCard';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import EmptyState from './EmptyState';
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

  const handleBulkDelete = () => {
    handleDeleteDialog(selectedRuleSets);
  };

  // Show empty state if no rule sets
  if (!ruleSets || ruleSets.length === 0) {
    return <EmptyState onCreateNew={() => navigate('/admin/rulesets/create')} />;
  }

  console.log('Rendering table with rule sets:', ruleSets);
  
  return (
    <>
      <div className="table-container">
        <BulkActionsToolbar
          selectedCount={selectedRuleSets.length}
          onBulkEnable={handleBulkEnable}
          onBulkDelete={handleBulkDelete}
        />
        
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
              {ruleSets.map((ruleSet) => (
                <RuleSetTableRow
                  key={ruleSet.id}
                  ruleSet={ruleSet}
                  isSelected={selectedRuleSets.includes(ruleSet.id)}
                  onSelect={(checked) => handleSelectRow(ruleSet.id, checked)}
                  onRowClick={() => handleRowClick(ruleSet.id)}
                  onEdit={(e) => handleEdit(ruleSet.id, e)}
                  onDuplicate={(e) => handleDuplicate(ruleSet.id, e)}
                  onDelete={(e) => handleDeleteDialog([ruleSet.id], e)}
                  onStatusChange={onStatusChange}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4 p-4">
          {ruleSets.map((ruleSet) => (
            <RuleSetMobileCard
              key={ruleSet.id}
              ruleSet={ruleSet}
              isSelected={selectedRuleSets.includes(ruleSet.id)}
              onSelect={(checked) => handleSelectRow(ruleSet.id, checked)}
              onRowClick={() => handleRowClick(ruleSet.id)}
              onEdit={(e) => handleEdit(ruleSet.id, e)}
              onDuplicate={(e) => handleDuplicate(ruleSet.id, e)}
              onDelete={(e) => handleDeleteDialog([ruleSet.id], e)}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </div>
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        deleteCount={deleteIds.length}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default RuleSetTable;
