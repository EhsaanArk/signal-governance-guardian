
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Market } from '@/types';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }).max(64, {
    message: 'Name must not exceed 64 characters.',
  }),
  description: z.string().optional(),
  markets: z.array(z.enum(['Forex', 'Crypto', 'Indices'])).min(1, {
    message: 'Please select at least one market.',
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
      markets: initialData?.markets || [],
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
      markets: data.markets as Market[]
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
          name="markets"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Markets</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {marketOptions.map((market) => (
                  <FormItem
                    key={market.id}
                    className="flex items-center space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(market.value)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, market.value]
                            : field.value.filter((value) => value !== market.value);
                          field.onChange(newValue);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      {market.label}
                    </FormLabel>
                  </FormItem>
                ))}
              </div>
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
