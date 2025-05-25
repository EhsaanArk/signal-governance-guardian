
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Provider } from '@/types/provider';
import MarketChip from '@/components/common/MarketChip';
import RuleSetToggle from './RuleSetToggle';
import AssignRuleSetModal from './AssignRuleSetModal';

interface ProviderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string | null;
  provider: Provider | null;
  onProviderUpdate: (providerId: string, updates: Partial<Provider>) => void;
}

interface BreachEvent {
  id: string;
  timestamp: string;
  type: string;
  rule: string;
}

interface AppliedRuleSet {
  id: string;
  name: string;
  isEnabled: boolean;
}

const ProviderDrawer: React.FC<ProviderDrawerProps> = ({
  isOpen,
  onClose,
  providerId,
  provider,
  onProviderUpdate
}) => {
  const { toast } = useToast();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!provider) return null;

  // Mock data for the drawer
  const mockStats = {
    winRate: 63,
    avgRR: 1.7,
    maxDD: -2.7,
    openTrades: 3
  };

  const mockBreaches: BreachEvent[] = [
    { id: '1', timestamp: '2025-05-24 02:09', type: 'Cooling-off', rule: 'Same Direction Guard' },
    { id: '2', timestamp: '2025-05-23 14:22', type: 'Signal Rejected', rule: 'Max Active Trades' },
    { id: '3', timestamp: '2025-05-23 09:15', type: 'Cooldown Triggered', rule: 'Positive Pip Cancel' },
    { id: '4', timestamp: '2025-05-22 16:30', type: 'Signal Rejected', rule: 'Same Direction Guard' },
    { id: '5', timestamp: '2025-05-22 11:45', type: 'Cooling-off', rule: 'Max Active Trades' }
  ];

  const mockAppliedRuleSets: AppliedRuleSet[] = [
    { id: '1', name: 'Forex Std Protection', isEnabled: false },
    { id: '2', name: 'Crypto HFT Trading', isEnabled: true },
    { id: '3', name: 'Risk Management Core', isEnabled: true }
  ];

  const handleSuspend = () => {
    if (!providerId) return;
    
    const newStatus = provider.status === 'Active' ? 'Suspended' : 'Active';
    onProviderUpdate(providerId, { status: newStatus });
    
    toast({
      title: `Provider ${newStatus.toLowerCase()} (mock)`,
      description: `${provider.provider_name} has been ${newStatus.toLowerCase()}.`,
    });
  };

  const handleResetCooldown = () => {
    toast({
      title: "Cooldown reset (mock)",
      description: `Cooldown has been reset for ${provider.provider_name}.`,
    });
  };

  const handleRuleSetToggle = (ruleSetId: string, isEnabled: boolean) => {
    toast({
      title: `Rule ${isEnabled ? 'applied' : 'removed'} (mock)`,
      description: `Rule set has been ${isEnabled ? 'applied to' : 'removed from'} ${provider.provider_name}.`,
    });
  };

  const handleBreachClick = (breach: BreachEvent) => {
    toast({
      title: "Would open Breach Log (mock)",
      description: `Breach from ${breach.timestamp} - ${breach.type}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Suspended': return 'bg-red-500';
      case 'Review': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatColor = (value: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value > 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return value < 0 ? 'text-red-600' : 'text-green-600';
    }
  };

  const DrawerInner = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{provider.provider_name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {provider.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                @{provider.email.split('@')[0]}
              </div>
            )}
            <span>•</span>
            <div className="flex gap-1">
              {provider.markets.map((market) => (
                <MarketChip key={market} market={market} size="sm" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(provider.status)}`} />
            <span className="text-sm">{provider.status}</span>
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">Live Stats</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Win-rate</div>
            <div className="text-lg font-semibold">{mockStats.winRate}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Avg RR</div>
            <div className="text-lg font-semibold">{mockStats.avgRR}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Max DD</div>
            <div className={`text-lg font-semibold ${getStatColor(mockStats.maxDD, false)}`}>
              {mockStats.maxDD}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Open trades</div>
            <div className="text-lg font-semibold">{mockStats.openTrades}</div>
          </div>
        </div>
      </div>

      {/* Last 10 Breaches */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">Last 10 breaches</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {mockBreaches.map((breach) => (
            <div
              key={breach.id}
              onClick={() => handleBreachClick(breach)}
              className="flex items-center gap-2 text-xs p-2 rounded hover:bg-muted cursor-pointer"
              title="Would open Breach Log (mock)"
            >
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="text-muted-foreground">{breach.timestamp}</span>
              <span>{breach.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rule-sets Applied */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">Rule-sets applied</h4>
        <div className="space-y-2">
          {mockAppliedRuleSets.map((ruleSet) => (
            <RuleSetToggle
              key={ruleSet.id}
              name={ruleSet.name}
              isEnabled={ruleSet.isEnabled}
              onToggle={(isEnabled) => handleRuleSetToggle(ruleSet.id, isEnabled)}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="font-medium text-sm text-muted-foreground">Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={provider.status === 'Active' ? 'destructive' : 'default'}
            size="sm"
            onClick={handleSuspend}
            className="w-full"
          >
            {provider.status === 'Active' ? 'Suspend' : 'Reinstate'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetCooldown}>
            Reset Cooldown
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAssignModalOpen(true)}
          className="w-full"
        >
          Assign Rule-set
        </Button>
      </div>

      <AssignRuleSetModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        providerName={provider.provider_name}
      />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Provider Details</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">
            <DrawerInner />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[420px] sm:max-w-[420px]">
        <SheetHeader>
          <SheetTitle>Provider Details</SheetTitle>
        </SheetHeader>
        <div className="mt-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          <DrawerInner />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProviderDrawer;
