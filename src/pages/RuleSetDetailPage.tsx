
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Edit, 
  Copy, 
  Trash2,
  AlertTriangle,
  Infinity,
  Ban,
  Check,
  Shield,
  ArrowLeft
} from 'lucide-react';

import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

import StatusToggle from '@/components/common/StatusToggle';
import MarketChip from '@/components/common/MarketChip';
import BreachBadge from '@/components/common/BreachBadge';
import { useBreachCountForRuleSet } from '@/hooks/useBreachCountForRuleSet';
import { CompleteRuleSet } from '@/types';

// Mock complete rule set data (same as used in EditRuleSetPage)
const mockCompleteRuleSet: CompleteRuleSet = {
  id: '1',
  name: 'Forex Standard Protection',
  description: 'Standard protection rules for forex traders',
  markets: ['Forex'],
  is_active: true,
  created_at: '2025-05-17T10:00:00Z',
  updated_at: '2025-05-18T15:30:00Z',
  created_by: undefined,
  enabledRules: {
    coolingOff: true,
    sameDirectionGuard: true,
    maxActiveTrades: false,
    positivePipCancelLimit: false
  },
  breaches24h: 5,
  status: true,
  
  coolingOff: {
    enabled: true,
    tiers: [
      { threshold: 2, window: 6, coolOff: 12 },
      { threshold: 3, window: 12, coolOff: 24 }
    ],
    metric: 'SLCount'
  },
  
  sameDirectionGuard: {
    enabled: true,
    pairScope: 'All',
    directions: { long: true, short: true }
  },
  
  maxActiveTrades: {
    enabled: false,
    baseCap: 3,
    incrementPerWin: 1,
    hardCap: null,
    resetPolicy: 'Never'
  },
  
  positivePipCancelLimit: {
    enabled: false,
    plBand: { from: 0, to: 5 },
    minHoldTime: 5,
    maxCancels: 2,
    window: 'UTCDay',
    suspensionDuration: 24
  }
};

const RuleSetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [ruleSet, setRuleSet] = useState<CompleteRuleSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Get breach count for current rule set with applied filters
  const { breachCount, isLoading: breachCountLoading } = useBreachCountForRuleSet(id || '');

  useEffect(() => {
    // In a real app, this would be an API call to fetch the rule set by ID
    // For now, using mock data
    if (id) {
      setRuleSet({ ...mockCompleteRuleSet, id });
      setLoading(false);
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/admin/rulesets/${id}/edit`);
  };

  const handleDuplicate = () => {
    // In a real app, this would duplicate the rule set
    toast.success(`Rule Set "${ruleSet?.name}" duplicated successfully`);
    navigate('/admin/rulesets');
  };

  const handleDelete = () => {
    // In a real app, this would delete the rule set
    toast.success(`Rule Set "${ruleSet?.name}" deleted successfully`);
    navigate('/admin/rulesets');
  };

  const handleBackToBreaches = () => {
    // Navigate back to breach log with preserved search parameters
    navigate(`/admin/breaches${location.search}`);
  };

  const handleStatusChange = (id: string, enabled: boolean) => {
    setRuleSet(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: enabled,
        is_active: enabled,
        updated_at: new Date().toISOString()
      };
    });
    toast.success(`Rule Set ${enabled ? 'enabled' : 'disabled'}`);
  };

  const renderRuleCard = (title: string, icon: React.ReactNode, enabled: boolean, config: any) => (
    <Card className={`${enabled ? 'border-primary' : 'border-muted'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          <span className={`text-xs px-2 py-1 rounded ${enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {enabled ? (
          <div className="text-sm text-muted-foreground">
            <pre className="whitespace-pre-wrap font-mono text-xs bg-muted p-2 rounded">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">This rule is currently disabled.</p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 flex justify-center">
          <p>Loading rule set...</p>
        </div>
      </MainLayout>
    );
  }

  if (!ruleSet) {
    return (
      <MainLayout>
        <div className="p-6 flex flex-col items-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <Shield className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mb-4">Rule set not found</p>
          <Button onClick={() => navigate('/admin/rulesets')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rule Sets
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header 
        title={
          <div className="flex items-center gap-4">
            <span>{ruleSet.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                {breachCountLoading ? 'Loading...' : `Breaches (selected period): ${breachCount}`}
              </Badge>
              {location.search && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBackToBreaches}
                  className="text-primary hover:text-primary/80"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back to breaches
                </Button>
              )}
            </div>
          </div>
        }
        subtitle={ruleSet.description}
        action={{
          label: 'Edit Rule Set',
          onClick: handleEdit
        }}
      />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Markets</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ruleSet.markets.map((market) => (
                    <MarketChip key={market} market={market} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <StatusToggle 
                    id={ruleSet.id} 
                    name={ruleSet.name}
                    enabled={ruleSet.status} 
                    onToggle={handleStatusChange} 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Breaches (24h)</label>
                <div className="mt-1">
                  <BreachBadge count={ruleSet.breaches24h} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm mt-1">
                  {new Date(ruleSet.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rules Configuration */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Rules Configuration</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderRuleCard(
                'Cooling Off',
                <AlertTriangle className="h-5 w-5 text-warning" />,
                ruleSet.enabledRules.coolingOff,
                ruleSet.coolingOff
              )}
              
              {renderRuleCard(
                'Same Direction Guard',
                <Ban className="h-5 w-5 text-primary" />,
                ruleSet.enabledRules.sameDirectionGuard,
                ruleSet.sameDirectionGuard
              )}
              
              {renderRuleCard(
                'Max Active Trades',
                <Infinity className="h-5 w-5 text-secondary" />,
                ruleSet.enabledRules.maxActiveTrades,
                ruleSet.maxActiveTrades
              )}
              
              {renderRuleCard(
                'Positive Pip Cancel Limit',
                <Check className="h-5 w-5 text-success" />,
                ruleSet.enabledRules.positivePipCancelLimit,
                ruleSet.positivePipCancelLimit
              )}
            </div>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Manage this rule set
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/rulesets')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the rule set "{ruleSet.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default RuleSetDetailPage;
