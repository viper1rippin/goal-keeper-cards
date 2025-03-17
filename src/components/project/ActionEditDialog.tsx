
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Action } from './ZodiacMindMap';

// Form validation schema
const actionSchema = z.object({
  content: z.string().min(1, "Action content is required"),
});

type ActionFormValues = z.infer<typeof actionSchema>;

interface ActionEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: Action) => void;
  action: Action | null;
  projectId: string;
}

const ActionEditDialog: React.FC<ActionEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  action,
  projectId,
}) => {
  // Initialize form with default values or editing values
  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      content: action?.content || "",
    },
  });

  // Reset form when dialog opens/closes or when editing a different action
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        content: action?.content || "",
      });
    }
  }, [isOpen, action, form]);

  // Handle form submission
  const onSubmit = (values: ActionFormValues) => {
    // Calculate random position if creating a new action
    const position_x = action?.position_x ?? Math.random() * 80 + 10; // 10-90%
    const position_y = action?.position_y ?? Math.random() * 80 + 10; // 10-90%
    
    onSave({
      ...(action || {}),
      content: values.content,
      position_x,
      position_y,
      project_id: projectId,
    });
    
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {action ? "Edit Action" : "Add New Action"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Action</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter action content..."
                      {...field}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {action ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ActionEditDialog;
