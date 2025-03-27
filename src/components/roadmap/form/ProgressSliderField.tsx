
import React from 'react';
import { Slider } from '@/components/ui/slider';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';

interface ProgressSliderFieldProps {
  form: UseFormReturn<any>;
}

const ProgressSliderField: React.FC<ProgressSliderFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="progress"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Progress: {field.value}%</FormLabel>
          <FormControl>
            <Slider
              value={[field.value]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => field.onChange(value[0])}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProgressSliderField;
