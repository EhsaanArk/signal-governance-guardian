
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Market } from '@/types';

// Define the form schema with single market selection
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }).max(64, {
    message: 'Name must not exceed 64 characters.',
  }),
  description: z.string().optional(),
  market: z.enum(['Forex', 'Crypto', 'Indices'], {
    required_error: 'Please select a market.',
  }),
});

type FormData = z.infer<typeof formSchema>;

interface Step1BasicsProps {
  initialData?: {
    name?: string;
    description?: string;
    markets?: Market[];
  };
  onNext: (data: { name: string; description?: string; markets: Market[] }) => void;
  onCancel: () => void;
}

const Step1Basics: React.FC<Step1BasicsProps> = ({ initialData, onNext, onCancel }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      market: initialData?.markets?.[0] || undefined,
    },
  });
  
  const marketOptions = [
    { id: 'forex', label: 'Forex', value: 'Forex' },
    { id: 'crypto', label: 'Crypto', value: 'Crypto' },
    { id: 'indices', label: 'Indices', value: 'Indices' },
  ] as const;
  
  const onSubmit = (data: FormData) => {
    onNext({
      name: data.name,
      description: data.description,
      markets: [data.market] as Market[]
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rule-Set name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter rule set name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a description of this rule set"
                  {...field}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="market"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Market*</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {marketOptions.map((market) => (
                    <div key={market.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={market.value} id={market.id} />
                      <Label htmlFor={market.id} className="font-normal cursor-pointer">
                        {market.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Next →
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Step1Basics;
