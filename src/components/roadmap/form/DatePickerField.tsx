
import React from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';

interface DatePickerFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  form,
  name,
  label,
}) => {
  const handleDateSelect = (date: Date | undefined, updateFn: (value: string) => void) => {
    if (date) {
      updateFn(date.toISOString());
      
      setTimeout(() => {
        const openPopover = document.querySelector('[data-state="open"][data-radix-popover-content-wrapper]');
        if (openPopover) {
          const popoverClose = openPopover.querySelector('[data-radix-popover-close]');
          if (popoverClose && popoverClose instanceof HTMLElement) {
            popoverClose.click();
          } else {
            const escEvent = new KeyboardEvent('keydown', {
              key: 'Escape',
              bubbles: false,
              cancelable: true
            });
            openPopover.dispatchEvent(escEvent);
          }
        }
      }, 0);
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(new Date(field.value), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => handleDateSelect(date, field.onChange)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DatePickerField;
