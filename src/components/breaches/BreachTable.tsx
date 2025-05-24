
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import MarketChip from '../common/MarketChip';
import { BreachLog } from '@/types';

interface BreachTableProps {
  breaches: BreachLog[];
  onEndCoolDown?: (id: string) => void;
}

const BreachTable: React.FC<BreachTableProps> = ({ breaches, onEndCoolDown }) => {
  const [selectedBreachId, setSelectedBreachId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('BreachTable received breaches:', breaches);
  console.log('BreachTable breaches count:', breaches.length);
  
  const selectedBreach = breaches.find(breach => breach.id === selectedBreachId);
  
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

  const handleViewDetails = (e: React.MouseEvent, breachId: string) => {
    e.stopPropagation();
    setSelectedBreachId(breachId);
  };

  const handleViewRuleSet = (e: React.MouseEvent, ruleSetId: string) => {
    e.stopPropagation();
    // Preserve current search parameters when navigating to rule set detail
    const targetUrl = `/admin/rulesets/${ruleSetId}${location.search}`;
    navigate(targetUrl);
  };

  const handleCloseSheet = () => {
    setSelectedBreachId(null);
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
                    Check console logs for debugging information
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your filters or date range
                  </p>
                </td>
              </tr>
            ) : (
              breaches.map((breach) => (
                <tr key={breach.id}>
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
                    <div className="flex gap-2">
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={(e) => handleViewDetails(e, breach.id)}
                      >
                        View
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="link" 
                            size="sm"
                            className="text-primary hover:text-primary/80 hover:underline"
                            onClick={(e) => handleViewRuleSet(e, breach.ruleSetId)}
                            aria-label="View rule-set configuration"
                          >
                            View rule-set
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open rule-set configuration</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={selectedBreachId !== null} onOpenChange={(open) => {
        if (!open) {
          handleCloseSheet();
        }
      }}>
        <SheetContent className="w-[480px] sm:w-[540px]">
          {selectedBreach && (
            <>
              <SheetHeader>
                <SheetTitle>Breach Details</SheetTitle>
                <SheetDescription>
                  {selectedBreach.timestamp && formatTimestamp(selectedBreach.timestamp)}
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Provider</h4>
                    <p>{selectedBreach.provider}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Market</h4>
                    <MarketChip market={selectedBreach.market} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Action</h4>
                    <Badge className={getActionBadgeColor(selectedBreach.action)}>
                      {selectedBreach.action}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Rule Information</h4>
                  <div className="rounded border p-3">
                    <div className="mb-1">{selectedBreach.ruleSetName}</div>
                    <div className="text-sm text-muted-foreground">{selectedBreach.subRule}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Details</h4>
                  <div className="rounded border p-3">
                    <p className="text-sm">{selectedBreach.details}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">JSON Snapshot</h4>
                  <div className="rounded border p-3 bg-muted/30">
                    <pre className="text-xs overflow-auto max-h-[200px]">
                      {JSON.stringify({
                        id: selectedBreach.id,
                        timestamp: selectedBreach.timestamp,
                        provider: selectedBreach.provider,
                        market: selectedBreach.market,
                        ruleSet: {
                          id: selectedBreach.ruleSetId,
                          name: selectedBreach.ruleSetName,
                        },
                        subRule: selectedBreach.subRule,
                        action: selectedBreach.action,
                        details: selectedBreach.details,
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
                
                {selectedBreach.action === 'Cooldown' && onEndCoolDown && (
                  <Button 
                    onClick={() => {
                      onEndCoolDown(selectedBreach.id);
                      handleCloseSheet();
                    }}
                    className="w-full"
                  >
                    End Cool-down
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BreachTable;
