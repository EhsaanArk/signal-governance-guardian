
import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MarketChip from '../common/MarketChip';
import { BreachLog } from '@/types';

interface BreachTableProps {
  breaches: BreachLog[];
  onEndCoolDown?: (id: string) => void;
}

const BreachTable: React.FC<BreachTableProps> = ({ breaches, onEndCoolDown }) => {
  const [selectedBreach, setSelectedBreach] = useState<BreachLog | null>(null);
  
  console.log('BreachTable received breaches:', breaches);
  
  const handleRowClick = (breach: BreachLog) => {
    setSelectedBreach(breach);
  };
  
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
  };
  
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'Cooldown':
        return 'bg-warning text-warning-foreground';
      case 'Rejected':
        return 'bg-destructive text-destructive-foreground';
      case 'Limited':
        return 'bg-secondary text-secondary-foreground';
      case 'Suspended':
        return 'bg-red-500 text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };
  
  return (
    <>
      <div className="table-container">
        <table className="nuroblock-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Provider</th>
              <th>Market</th>
              <th>Rule-Set / Sub-Rule</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {breaches.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  <p className="text-muted-foreground">No breach logs found</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Try adjusting your filters or date range
                  </p>
                </td>
              </tr>
            ) : (
              breaches.map((breach) => (
                <tr 
                  key={breach.id} 
                  onClick={() => handleRowClick(breach)}
                  className="cursor-pointer hover:bg-muted/30"
                >
                  <td>{formatTimestamp(breach.timestamp)}</td>
                  <td>{breach.provider}</td>
                  <td>
                    <MarketChip market={breach.market} />
                  </td>
                  <td>
                    <div>
                      <div>{breach.ruleSetName}</div>
                      <div className="text-xs text-muted-foreground">{breach.subRule}</div>
                    </div>
                  </td>
                  <td>
                    <Badge className={getActionBadgeColor(breach.action)}>
                      {breach.action}
                    </Badge>
                  </td>
                  <td>
                    <Sheet open={selectedBreach?.id === breach.id} onOpenChange={(open) => {
                      if (!open) setSelectedBreach(null);
                    }}>
                      <SheetTrigger asChild>
                        <Button variant="link" size="sm">
                          View
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[480px] sm:w-[540px]">
                        <SheetHeader>
                          <SheetTitle>Breach Details</SheetTitle>
                          <SheetDescription>
                            {breach.timestamp && formatTimestamp(breach.timestamp)}
                          </SheetDescription>
                        </SheetHeader>
                        
                        <div className="mt-6 space-y-6">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-1">Provider</h4>
                              <p>{breach.provider}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Market</h4>
                              <MarketChip market={breach.market} />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Action</h4>
                              <Badge className={getActionBadgeColor(breach.action)}>
                                {breach.action}
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Rule Information</h4>
                            <div className="rounded border p-3">
                              <div className="mb-1">{breach.ruleSetName}</div>
                              <div className="text-sm text-muted-foreground">{breach.subRule}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Details</h4>
                            <div className="rounded border p-3">
                              <p className="text-sm">{breach.details}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">JSON Snapshot</h4>
                            <div className="rounded border p-3 bg-muted/30">
                              <pre className="text-xs overflow-auto max-h-[200px]">
                                {JSON.stringify({
                                  id: breach.id,
                                  timestamp: breach.timestamp,
                                  provider: breach.provider,
                                  market: breach.market,
                                  ruleSet: {
                                    id: breach.ruleSetId,
                                    name: breach.ruleSetName,
                                  },
                                  subRule: breach.subRule,
                                  action: breach.action,
                                  details: breach.details,
                                }, null, 2)}
                              </pre>
                            </div>
                          </div>
                          
                          {breach.action === 'Cooldown' && onEndCoolDown && (
                            <Button 
                              onClick={() => {
                                onEndCoolDown(breach.id);
                                setSelectedBreach(null);
                              }}
                              className="w-full"
                            >
                              End Cool-down
                            </Button>
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default BreachTable;
