
import React from 'react';
import { MoreHorizontal, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MarketChip from '@/components/common/MarketChip';
import { Provider } from '@/types/provider';

interface ProvidersTableProps {
  providers: Provider[];
  selectedProviders: string[];
  onProviderClick: (providerId: string) => void;
  onProviderSelect: (providerId: string) => void;
  onSelectAll: () => void;
}

const ProvidersTable: React.FC<ProvidersTableProps> = ({ 
  providers, 
  selectedProviders, 
  onProviderClick, 
  onProviderSelect,
  onSelectAll 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Suspended': return 'bg-red-500';
      case 'Review': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-600';
    if (pnl < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleRowClick = (provider: Provider, event: React.MouseEvent) => {
    // Don't trigger row click if clicking on checkbox or dropdown
    if ((event.target as HTMLElement).closest('button') || 
        (event.target as HTMLElement).closest('[role="checkbox"]')) {
      return;
    }
    onProviderClick(provider.id);
  };

  const handleMenuClick = (provider: Provider) => {
    onProviderClick(provider.id);
  };

  // Calculate checkbox state for header
  const allSelected = providers.length > 0 && selectedProviders.length === providers.length;
  const someSelected = selectedProviders.length > 0 && selectedProviders.length < providers.length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onCheckedChange={onSelectAll}
                aria-label="Select all providers on this page"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Markets</TableHead>
            <TableHead>Followers</TableHead>
            <TableHead>30-d PnL</TableHead>
            <TableHead>Draw-down</TableHead>
            <TableHead>Breaches</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => (
            <TableRow 
              key={provider.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={(e) => handleRowClick(provider, e)}
            >
              <TableCell>
                <Checkbox
                  checked={selectedProviders.includes(provider.id)}
                  onCheckedChange={() => onProviderSelect(provider.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{provider.provider_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {provider.markets.map((market) => (
                    <MarketChip key={market} market={market} />
                  ))}
                </div>
              </TableCell>
              <TableCell>{provider.followers?.toLocaleString() || '---'}</TableCell>
              <TableCell>
                <span className={getPnLColor(provider.pnl30d || 0)}>
                  {provider.pnl30d ? `${provider.pnl30d > 0 ? '+' : ''}${provider.pnl30d.toFixed(1)}%` : '---'}
                </span>
              </TableCell>
              <TableCell>
                <span className={getPnLColor(-(provider.drawdown || 0))}>
                  {provider.drawdown ? `-${provider.drawdown.toFixed(1)}%` : '---'}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {provider.breaches || 0}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(provider.status)}`} />
                  <span className="text-sm">{provider.status}</span>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleMenuClick(provider)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMenuClick(provider)}>
                      Manage
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProvidersTable;
