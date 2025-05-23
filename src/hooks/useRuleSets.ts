
import { toast } from 'sonner';
import { useRuleSetData } from './useRuleSetData';
import { useRuleSetStatus } from './useRuleSetStatus';
import { duplicateRuleSet, deleteRuleSets } from '@/lib/api/rule-set-operations';

export const useRuleSets = () => {
  const {
    ruleSets,
    setRuleSets,
    isLoading,
    loadRuleSets
  } = useRuleSetData();

  const { handleStatusChange } = useRuleSetStatus(setRuleSets);

  const handleDuplicate = async (id: string) => {
    const ruleSetToDuplicate = ruleSets.find(rs => rs.id === id);

    if (ruleSetToDuplicate) {
      const result = await duplicateRuleSet(id, ruleSetToDuplicate.name);
      if (result.success) {
        loadRuleSets(); // Reload the list
      }
    }
  };

  const handleDelete = async (ids: string[]) => {
    const result = await deleteRuleSets(ids, ruleSets);
    if (result.success) {
      loadRuleSets(); // Reload the list
    }
  };

  return {
    ruleSets,
    isLoading,
    loadRuleSets,
    handleDuplicate,
    handleDelete,
    handleStatusChange
  };
};
