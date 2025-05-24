
import { Market } from '@/types/database';

export interface Provider {
  id: string;
  provider_name: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  
  // Extended properties for UI
  markets: Market[];
  followers?: number;
  pnl30d?: number; // 30-day PnL percentage
  drawdown?: number; // Current drawdown percentage
  breaches?: number; // Number of breaches in selected time range
  status: 'Active' | 'Suspended' | 'Review';
}
