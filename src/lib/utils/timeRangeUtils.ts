
import { TimeRangePreset } from '@/types/dashboardFilters';

export const getDateRangeFromPreset = (preset: TimeRangePreset): { from: Date; to: Date } => {
  const now = new Date();
  const to = now;
  
  switch (preset) {
    case '24h':
      return { from: new Date(now.getTime() - 24 * 60 * 60 * 1000), to };
    case '7d':
      return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to };
    case '30d':
      return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to };
    case '90d':
      return { from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to };
    default:
      return { from: new Date(now.getTime() - 24 * 60 * 60 * 1000), to };
  }
};

export const getComparePeriod = (from: Date, to: Date): { from: Date; to: Date } => {
  const duration = to.getTime() - from.getTime();
  const compareFrom = new Date(from.getTime() - duration);
  const compareTo = new Date(from.getTime());
  return { from: compareFrom, to: compareTo };
};

export const validateCustomDateRange = (from: Date, to: Date, maxDays: number = 180): void => {
  const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > maxDays) {
    throw new Error(`Date range cannot exceed ${maxDays} days`);
  }
};
