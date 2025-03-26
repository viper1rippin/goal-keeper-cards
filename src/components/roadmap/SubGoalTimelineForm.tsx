
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SubGoalTimelineItem } from "./types";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  progress: z.number().min(0).max(100),
  row: z.number().min(0),
  start: z.number().min(0).max(11),
  duration: z.number().min(1).max(12),
});

type FormValues = z.infer<typeof formSchema>;

interface SubGoalTimelineFormProps {
  item: SubGoalTimelineItem | null;
  roadmapId: string;
  onSave: (item: SubGoalTimelineItem) => void;
  onCancel: () => void;
  generateId: () => string;
  maxRows: number;
}

export const SubGoalTimelineForm = ({
  item,
  roadmapId,
  onSave,
  onCancel,
  generateId,
  maxRows
}: SubGoalTimelineFormProps) => {
  // Setup the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item?.title || "",
      description: item?.description || "",
      progress: item?.progress || 0,
      row: item?.row || 0,
      start: item?.start || 0,
      duration: item?.duration || 2,
    },
  });

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    const savedItem: SubGoalTimelineItem = {
      id: item?.id || generateId(),
      title: values.title,
      description: values.description,
      progress: values.progress,
      row: values.row,
      start: values.start,
      duration: values.duration,
      parentId: item?.parentId,
      originalSubGoalId: item?.originalSubGoalId,
    };
    
    onSave(savedItem);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300">Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter goal title"
                  className="bg-slate-800 border-slate-700 text-white"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter goal description"
                  className="bg-slate-800 border-slate-700 text-white resize-none h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300">
                Progress: {field.value}%
              </FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                  className="py-4"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="row"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">
                  Row: {field.value + 1}
                </FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={maxRows - 1}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="py-4"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="start"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">
                  Start Month: {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][field.value]}
                </FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={11}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="py-4"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300">
                Duration: {field.value} month{field.value > 1 ? 's' : ''}
              </FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={12}
                  step={1}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                  className="py-4"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {item ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
