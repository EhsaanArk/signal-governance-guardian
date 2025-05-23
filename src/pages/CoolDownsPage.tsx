
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import CooldownStats from '@/components/cooldowns/CooldownStats';
import CooldownList from '@/components/cooldowns/CooldownList';

import { CoolDown, CoolDownStats } from '@/types';

// Mock data for cooldowns
const mockCoolDowns: CoolDown[] = [
  {
    id: '1',
    provider: 'AlphaTrader',
    market: 'Forex',
    ruleSetId: '1',
    ruleSetName: 'Forex Standard Protection',
    startedAt: '2025-05-20T10:30:00Z',
    endsAt: '2025-05-21T10:30:00Z',
    remainingTime: '14h 30m'
  },
  {
    id: '2',
    provider: 'CryptoWhale',
    market: 'Crypto',
    ruleSetId: '2',
    ruleSetName: 'Crypto Enhanced Guard',
    startedAt: '2025-05-20T08:45:00Z',
    endsAt: '2025-05-21T20:45:00Z',
    remainingTime: '1d 0h 45m'
  },
  {
    id: '3',
    provider: 'ForexPro',
    market: 'Forex',
    ruleSetId: '1',
    ruleSetName: 'Forex Standard Protection',
    startedAt: '2025-05-20T16:20:00Z',
    endsAt: '2025-05-21T04:20:00Z',
    remainingTime: '8h 20m'
  },
];

const mockStats: CoolDownStats = {
  providersInCooldown: 3,
  avgRemainingTime: '15h 12m',
  topBreachedRuleSet: {
    name: 'Forex Standard Protection',
    count: 8
  }
};

const CoolDownsPage: React.FC = () => {
  const [cooldowns, setCooldowns] = useState<CoolDown[]>(mockCoolDowns);
  const [stats, setStats] = useState<CoolDownStats>(mockStats);
  
  const handleEndCooldown = (id: string, reason: string) => {
    // In a real app, this would make an API request
    setCooldowns(cooldowns.filter(cd => cd.id !== id));
    setStats({
      ...stats,
      providersInCooldown: stats.providersInCooldown - 1
    });
    
    toast.success(`Cool-down ended for reason: ${reason}`);
  };
  
  return (
    <MainLayout>
      <Header title="Signal Governance – Active Cool-downs" />
      
      <div className="p-6 space-y-6">
        <CooldownStats stats={stats} />
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/20 px-4 py-3 border-b">
            <h2 className="text-lg font-medium">Active Cool-downs</h2>
          </div>
          <div className="p-4">
            <CooldownList 
              cooldowns={cooldowns}
              onEndCooldown={handleEndCooldown}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CoolDownsPage;
