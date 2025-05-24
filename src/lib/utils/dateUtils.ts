
export const getDefaultDateRange = (preset: string = '24h') => {
  const now = new Date();
  const to = now;
  
  switch (preset) {
    case '24h':
      return { 
        from: new Date(now.getTime() - 24 * 60 * 60 * 1000), 
        to 
      };
    case '7d':
      return { 
        from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), 
        to 
      };
    case '30d':
      return { 
        from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 
        to 
      };
    case '90d':
      return { 
        from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), 
        to 
      };
    default:
      return { 
        from: new Date(now.getTime() - 24 * 60 * 60 * 1000), 
        to 
      };
  }
};

export const getComparePeriod = (from: Date, to: Date) => {
  const duration = to.getTime() - from.getTime();
  const compareFrom = new Date(from.getTime() - duration);
  const compareTo = new Date(from.getTime());
  return { from: compareFrom, to: compareTo };
};

export const formatTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

export const validateDateRange = (from: Date, to: Date, maxDays: number = 180) => {
  const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > maxDays) {
    throw new Error(`Date range cannot exceed ${maxDays} days`);
  }
  
  if (from >= to) {
    throw new Error('Start date must be before end date');
  }
  
  return true;
};

export const toISODateString = (date: Date): string => {
  return date.toISOString();
};
