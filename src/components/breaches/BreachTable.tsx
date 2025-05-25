
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import MarketChip from '../common/MarketChip';
import { BreachLog } from '@/types';

interface BreachTableProps {
  breaches: BreachLog[];
  onEndCoolDown?: (id: string) => void;
}

const BreachTable: React.FC<BreachTableProps> = ({ breaches, onEndCoolDown }) => {
  const [selectedBreachId, setSelectedBreachId] = useState<string | null>(null);
  const [isJsonExpanded, setIsJsonExpanded] = useState(false);
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
        return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'Rejected':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'Suspended':
        return 'bg-amber-600 text-white hover:bg-amber-700';
      case 'Limited':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const handleRowClick = (breachId: string) => {
    setSelectedBreachId(breachId);
    setIsJsonExpanded(false); // Reset JSON accordion when opening new breach
  };

  const handleViewDetails = (e: React.MouseEvent, breachId: string) => {
    e.stopPropagation();
    handleRowClick(breachId);
  };

  const handleViewRuleSet = (e: React.MouseEvent, ruleSetId: string) => {
    e.stopPropagation();
    // Preserve current search parameters when navigating to rule set detail
    const targetUrl = `/admin/rulesets/${ruleSetId}${location.search}`;
    navigate(targetUrl);
  };

  const handleCloseSheet = () => {
    setSelectedBreachId(null);
    setIsJsonExpanded(false);
  };

  const handleEndCooldown = () => {
    if (selectedBreach && onEndCoolDown) {
      onEndCoolDown(selectedBreach.id);
      handleCloseSheet();
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
                    Check console logs for debugging information
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your filters or date range
                  </p>
                </td>
              </tr>
            ) : (
              breaches.map((breach) => (
                <tr 
                  key={breach.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(breach.id)}
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
        <SheetContent 
          className="w-[420px] sm:w-[420px]"
          role="dialog"
          aria-labelledby="breach-details-title"
        >
          {selectedBreach && (
            <>
              <SheetHeader>
                <SheetTitle id="breach-details-title">Breach Details</SheetTitle>
                <SheetDescription>
                  {selectedBreach.timestamp && formatTimestamp(selectedBreach.timestamp)}
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Provider</h4>
                    <p>{selectedBreach.provider}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Market</h4>
                    <MarketChip market={selectedBreach.market} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Action</h4>
                    <Badge className={getActionBadgeColor(selectedBreach.action)}>
                      {selectedBreach.action}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">Rule Information</h4>
                  <div className="rounded border p-3 bg-gray-50">
                    <div className="font-medium mb-1">{selectedBreach.ruleSetName}</div>
                    <div className="text-sm text-muted-foreground">{selectedBreach.subRule}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">Details</h4>
                  <div className="rounded border p-3 bg-gray-50">
                    <p className="text-sm">{selectedBreach.details}</p>
                  </div>
                </div>
                
                <div>
                  <Collapsible open={isJsonExpanded} onOpenChange={setIsJsonExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex items-center gap-2 p-0 h-auto text-sm font-semibold text-gray-600"
                        aria-expanded={isJsonExpanded}
                      >
                        JSON Snapshot
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isJsonExpanded ? 'rotate-180' : ''
                          }`} 
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1">
                      <div className="rounded border p-3 bg-muted/30">
                        <pre className="text-xs overflow-auto max-h-[200px] whitespace-pre-wrap">
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
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                {selectedBreach.action === 'Cooldown' && (
                  <Button 
                    onClick={handleEndCooldown}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
