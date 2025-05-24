
import React, { useState } from 'react';
import { Check, ChevronDown, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Provider {
  id: string;
  provider_name: string;
}

interface ProviderSelectorProps {
  selectedProviderId: string | null;
  onProviderChange: (providerId: string | null, providerName: string | null) => void;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProviderId,
  onProviderChange,
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const { data: providers, isLoading } = useQuery({
    queryKey: ['providers', searchValue],
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

  const handleProviderSelect = (provider: Provider | null) => {
    if (provider) {
      onProviderChange(provider.id, provider.provider_name);
    } else {
      onProviderChange(null, null);
    }
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
          >
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {getDisplayValue()}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {selectedProviderId && (
                <X 
                  className="h-3 w-3 hover:bg-muted rounded-sm p-0.5 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProviderSelect(null);
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
