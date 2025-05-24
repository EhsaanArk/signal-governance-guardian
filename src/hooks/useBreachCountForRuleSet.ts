
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchBreachCountForRuleSet } from '@/lib/api/breach-counts';
import { Market } from '@/types/database';

const getDateRangeFromParams = (searchParams: URLSearchParams) => {
  const rangeParam = searchParams.get('range');
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  
  if (fromParam && toParam) {
    return {
      startDate: new Date(fromParam),
      endDate: new Date(toParam)
    };
  }
  
  if (rangeParam) {
    const now = new Date();
    let startDate = new Date(now);
    
    switch (rangeParam) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 1);
    }
    
    startDate.setHours(0, 0, 0, 0);
    return { startDate, endDate: now };
  }
  
  // Default to 24h if no range specified
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1);
  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate: new Date() };
};

export const useBreachCountForRuleSet = (ruleSetId: string) => {
  const [searchParams] = useSearchParams();
  
  const { data: breachCount = 0, isLoading } = useQuery({
    queryKey: ['breachCountForRuleSet', ruleSetId, searchParams.toString()],
    queryFn: async () => {
      const { startDate, endDate } = getDateRangeFromParams(searchParams);
      const providerId = searchParams.get('provider');
      const market = searchParams.get('market') as Market | null;
      
      const { count, error } = await fetchBreachCountForRuleSet({
        ruleSetId,
        startDate,
        endDate,
        providerId: providerId || undefined,
        market: market || undefined
      });
      
      if (error) {
        console.error('Error fetching breach count:', error);
        return 0;
      }
      
      return count;
    },
    enabled: !!ruleSetId
  });
  
  return { breachCount, isLoading };
};
