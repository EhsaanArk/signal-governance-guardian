
import { toast } from 'sonner';
import { updateRuleSet } from '@/lib/api/rule-sets';
import { CompleteRuleSet } from '@/types';

export const useRuleSetStatus = (
  setRuleSets: React.Dispatch<React.SetStateAction<CompleteRuleSet[]>>
) => {
  const handleStatusChange = async (id: string, enabled: boolean) => {
    try {
      const { error } = await updateRuleSet(id, { is_active: enabled });

      if (error) throw error;

      // Update local state
      setRuleSets(prev =>
        prev.map(rs =>
          rs.id === id
            ? { ...rs, status: enabled, is_active: enabled, updated_at: new Date().toISOString() }
            : rs
        )
      );

    } catch (error) {
      console.error('Error updating rule set status:', error);
      toast.error('Failed to update rule set status');
    }
  };

  return { handleStatusChange };
};
