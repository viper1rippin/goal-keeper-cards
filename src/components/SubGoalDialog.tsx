
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubGoalForm, SubGoalFormData } from "./subgoal/SubGoalForm";
import { useAuth } from "@/context/AuthContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface SubGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentGoalId: string;
  subGoalToEdit?: {
    id: string;
    title: string;
    description: string;
    progress: number;
  } | null;
  onSubGoalSaved: () => void;
}

// Form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).optional().default(0)
});

const SubGoalDialog = ({
  isOpen,
  onClose,
  parentGoalId,
  subGoalToEdit,
  onSubGoalSaved,
}: SubGoalDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Initialize form with React Hook Form
  const form = useForm<SubGoalFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: subGoalToEdit?.title || "",
      description: subGoalToEdit?.description || "",
      progress: subGoalToEdit?.progress || 0
    }
  });
  
  // Reset form when dialog opens/closes or subGoalToEdit changes
  useState(() => {
    if (isOpen) {
      form.reset({
        title: subGoalToEdit?.title || "",
        description: subGoalToEdit?.description || "",
        progress: subGoalToEdit?.progress || 0
      });
    }
  });

  const handleSave = async (formData: SubGoalFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save sub-goals.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (subGoalToEdit?.id) {
        // Update existing sub-goal
        const { error } = await supabase
          .from('sub_goals')
          .update({
            title: formData.title,
            description: formData.description,
            progress: formData.progress || 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', subGoalToEdit.id);
        
        if (error) throw error;
        
        toast({
          title: "Sub-goal updated",
          description: "Your sub-goal has been updated successfully."
        });
      } else {
        // Create new sub-goal
        const { error } = await supabase
          .from('sub_goals')
          .insert([{
            title: formData.title,
            description: formData.description,
            progress: formData.progress || 0,
            parent_goal_id: parentGoalId
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Sub-goal created",
          description: "Your new sub-goal has been created successfully."
        });
      }
      
      // Close dialog and refresh goals
      onClose();
      onSubGoalSaved();
    } catch (error) {
      console.error("Error saving sub-goal:", error);
      toast({
        title: "Error",
        description: "Failed to save the sub-goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !subGoalToEdit?.id) return;
    
    try {
      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', subGoalToEdit.id);
      
      if (error) throw error;
      
      toast({
        title: "Sub-goal deleted",
        description: "Your sub-goal has been deleted successfully."
      });
      
      // Close dialog and refresh goals
      onClose();
      onSubGoalSaved();
    } catch (error) {
      console.error("Error deleting sub-goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete the sub-goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {subGoalToEdit ? 'Edit Sub-Goal' : 'Create New Sub-Goal'}
          </DialogTitle>
        </DialogHeader>
        
        <SubGoalForm
          form={form}
          onSubmit={handleSave}
          onClose={onClose}
          subGoalToEdit={subGoalToEdit}
          onDelete={subGoalToEdit ? handleDelete : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SubGoalDialog;
