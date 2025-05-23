
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MarketChip from '../common/MarketChip';
import { CoolDown } from '@/types';

interface CooldownListProps {
  cooldowns: CoolDown[];
  onEndCooldown: (id: string, reason: string) => void;
}

const CooldownList: React.FC<CooldownListProps> = ({ cooldowns, onEndCooldown }) => {
  const [selectedCooldown, setSelectedCooldown] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [endReason, setEndReason] = useState('');
  
  const handleEndNowClick = (id: string) => {
    setSelectedCooldown(id);
    setDialogOpen(true);
  };
  
  const handleConfirmEnd = () => {
    if (selectedCooldown && endReason) {
      onEndCooldown(selectedCooldown, endReason);
      setDialogOpen(false);
      setEndReason('');
      setSelectedCooldown(null);
    }
  };
  
  return (
    <>
      <div className="space-y-2">
        {cooldowns.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No active cooldowns</p>
          </div>
        ) : (
          cooldowns.map((cooldown) => (
            <div
              key={cooldown.id}
              className="border rounded-md p-4 hover:border-primary transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <div>
                  <h4 className="text-sm font-medium">Provider</h4>
                  <p>{cooldown.provider}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Market</h4>
                  <MarketChip market={cooldown.market} />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Ends in</h4>
                  <p className="text-amber-500 font-medium">{cooldown.remainingTime}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Rule Set</h4>
                  <p>{cooldown.ruleSetName}</p>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => handleEndNowClick(cooldown.id)}
                  >
                    End now
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Cooldown Early</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to end this cooldown before its scheduled expiration.
              Please provide a reason for this override.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <Select onValueChange={(value) => setEndReason(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false_positive">False positive</SelectItem>
                <SelectItem value="client_request">Client request</SelectItem>
                <SelectItem value="rule_misconfiguration">Rule misconfiguration</SelectItem>
                <SelectItem value="testing">Testing or simulation</SelectItem>
                <SelectItem value="other">Other (specify)</SelectItem>
              </SelectContent>
            </Select>
            
            {endReason === 'other' && (
              <Textarea 
                placeholder="Specify the reason..." 
                onChange={(e) => setEndReason(e.target.value)}
                className="min-h-[100px]"
              />
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEnd} disabled={!endReason}>
              End Cooldown
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CooldownList;
