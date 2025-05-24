
import React, { useState } from 'react';
import { Check, ChevronDown, User, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useFilterTransitions } from '@/hooks/useFilterTransitions';
import { queryKeys } from '@/lib/utils/queryKeys';

interface Provider {
  id: string;
  provider_name: string;
}

interface ProviderSelectorProps {
  selectedProviderId: string | null;
  onProviderChange: (providerId: string | null, providerName: string | null) => Promise<void>;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProviderId,
  onProviderChange,
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { isTransitioning, handleFilterChange } = useFilterTransitions();

  const { data: providers, isLoading } = useQuery({
    queryKey: queryKeys.providers.list(searchValue),
    queryFn: async () => {
      let query = supabase
        .from('signal_providers')
        .select('id, provider_name')
        .eq('is_active', true)
        .order('provider_name');

      if (searchValue.trim()) {
        query = query.ilike('provider_name', `%${searchValue}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as Provider[];
    },
    refetchInterval: 60000,
  });

  const selectedProvider = providers?.find(p => p.id === selectedProviderId);

  const handleProviderSelect = async (provider: Provider | null) => {
    await handleFilterChange(async () => {
      if (provider) {
        await onProviderChange(provider.id, provider.provider_name);
      } else {
        await onProviderChange(null, null);
      }
    });
    setOpen(false);
    setSearchValue('');
  };

  const getDisplayValue = () => {
    if (selectedProvider) {
      return selectedProvider.provider_name;
    }
    return 'All providers';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">Provider:</span>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select provider"
            className="w-60 justify-between h-8"
            disabled={isTransitioning}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isTransitioning ? (
                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
              ) : (
                <User className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="truncate">
                {getDisplayValue()}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {selectedProviderId && !isTransitioning && (
                <X 
                  className="h-3 w-3 hover:bg-muted rounded-sm p-0.5 cursor-pointer"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await handleProviderSelect(null);
                  }}
                />
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-60 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search providers..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
              disabled={isTransitioning}
            />
            <CommandList className="max-h-60">
              {isLoading ? (
                <div className="p-2 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <CommandEmpty>No providers found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all-providers"
                      onSelect={() => handleProviderSelect(null)}
                      className="cursor-pointer"
                      disabled={isTransitioning}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          !selectedProviderId ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-3 w-3" />
                        </div>
                        <span>All providers</span>
                      </div>
                    </CommandItem>
                    
                    {providers?.map((provider) => (
                      <CommandItem
                        key={provider.id}
                        value={provider.id}
                        onSelect={() => handleProviderSelect(provider)}
                        className="cursor-pointer"
                        disabled={isTransitioning}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            selectedProviderId === provider.id ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-700">
                              {provider.provider_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="truncate">{provider.provider_name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedProviderId && (
        <div className="hidden lg:block w-2 h-2 rounded-full bg-blue-500" title="Viewing filtered provider" />
      )}
    </div>
  );
};

export default ProviderSelector;
