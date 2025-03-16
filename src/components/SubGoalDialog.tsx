import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Goal } from './GoalRow';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

// Form validation schema
const subGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type SubGoalFormValues = z.infer<typeof subGoalSchema>;

interface SubGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'progress'>) => void;
  subGoalToEdit: Goal | null;
  parentGoalTitle: string;
  parentGoalId: string;
}

// Component for the delete confirmation dialog
const DeleteConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  onConfirmDelete 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onConfirmDelete: () => void 
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
        <AlertDialogDescription className="text-slate-400">
          This action cannot be undone. This will permanently delete the sub-goal.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</AlertDialogCancel>
        <AlertDialogAction 
          onClick={onConfirmDelete}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Main component
const SubGoalDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  subGoalToEdit,
  parentGoalTitle,
  parentGoalId
}: SubGoalDialogProps) => {
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  // Initialize form with default values or editing values
  const form = useForm<SubGoalFormValues>({
    resolver: zodResolver(subGoalSchema),
    defaultValues: {
      title: subGoalToEdit?.title || "",
      description: subGoalToEdit?.description || "",
    },
  });

  // Reset form when dialog opens/closes or when editing a different goal
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: subGoalToEdit?.title || "",
        description: subGoalToEdit?.description || "",
      });
    }
  }, [isOpen, subGoalToEdit, form]);

  // Handle form submission
  const onSubmit = async (values: SubGoalFormValues) => {
    try {
      await saveSubGoal(values);
      form.reset();
    } catch (error) {
      console.error("Error saving sub-goal:", error);
      toast({
        title: "Error saving sub-goal",
        description: "There was an error saving your sub-goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveSubGoal = async (values: SubGoalFormValues) => {
    // Prepare sub-goal data
    const subGoalData = {
      parent_goal_id: parentGoalId,
      title: values.title,
      description: values.description,
      progress: subGoalToEdit?.progress || 0
    };
    
    // If editing, update the existing sub-goal
    if (subGoalToEdit && subGoalToEdit.id) {
      const { error } = await supabase
        .from('sub_goals')
        .update(subGoalData)
        .eq('id', subGoalToEdit.id);
      
      if (error) throw error;
    } else {
      // Otherwise, create a new sub-goal
      const { error } = await supabase
        .from('sub_goals')
        .insert(subGoalData);
      
      if (error) throw error;
    }
    
    // Call the onSave callback to update UI
    onSave({
      title: values.title,
      description: values.description,
    });
  };

  const handleDelete = async () => {
    if (!subGoalToEdit || !subGoalToEdit.id) return;
    
    try {
      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', subGoalToEdit.id);
      
      if (error) throw error;
      
      toast({
        title: "Sub-goal deleted",
        description: "The sub-goal has been successfully deleted.",
      });
      
      setShowDeleteAlert(false);
      onClose();
      // Pass empty object to trigger refresh
      onSave({ title: "", description: "" });
    } catch (error) {
      console.error("Error deleting sub-goal:", error);
      toast({
        title: "Error deleting sub-goal",
        description: "There was an error deleting your sub-goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {subGoalToEdit ? "Edit Sub-Goal" : "Add New Sub-Goal"}
            </DialogTitle>
            <p className="text-slate-400 mt-1">
              {parentGoalTitle ? `For parent goal: ${parentGoalTitle}` : ''}
            </p>
          </DialogHeader>

          <SubGoalForm 
            form={form} 
            onSubmit={onSubmit} 
            subGoalToEdit={subGoalToEdit}
            onClose={onClose}
            onDelete={() => setShowDeleteAlert(true)}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog 
        open={showDeleteAlert} 
        onOpenChange={setShowDeleteAlert} 
        onConfirmDelete={handleDelete} 
      />
    </>
  );
};

// Form component extracted for better organization
interface SubGoalFormProps {
  form: ReturnType<typeof useForm<SubGoalFormValues>>;
  onSubmit: (values: SubGoalFormValues) => Promise<void>;
  onClose: () => void;
  onDelete: () => void;
  subGoalToEdit: Goal | null;
}

const SubGoalForm = ({ form, onSubmit, onClose, onDelete, subGoalToEdit }: SubGoalFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">Title</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter sub-goal title"
                  className="bg-slate-800 border-slate-700 text-white"
                />
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
              <FormLabel className="text-slate-200">Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter sub-goal description"
                  className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          {subGoalToEdit && subGoalToEdit.id && (
            <Button 
              variant="ghost" 
              type="button"
              onClick={onDelete}
              className="text-red-500 hover:text-red-400 hover:bg-red-900/10 flex gap-2 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="text-slate-400 hover:bg-slate-800/20 hover:text-slate-300"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-emerald hover:bg-emerald-dark"
            >
              {subGoalToEdit ? "Update" : "Create"} Sub-Goal
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default SubGoalDialog;
