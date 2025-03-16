
import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

// Define form schema using zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long")
});

type FormValues = z.infer<typeof formSchema>;

interface ParentGoalFormProps {
  initialData?: { id?: string; title: string; description: string } | null;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
  showDelete?: boolean;
  onDelete?: () => void;
}

const ParentGoalForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  showDelete = false,
  onDelete 
}: ParentGoalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || ""
    }
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to save the goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle key press in the description field
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if Enter is pressed (without Shift key to allow multiline text)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      form.handleSubmit(handleSubmit)(); // Submit the form
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {initialData ? "Edit Goal" : "Create New Goal"}
        </h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter goal title" 
                    {...field} 
                    className="bg-background/50 border-slate-800/30 focus:border-emerald/30"
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your goal" 
                    {...field}
                    className="min-h-[100px] bg-background/50 border-slate-800/30 focus:border-emerald/30"
                    onKeyDown={handleKeyDown}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4">
            {showDelete && (
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
                variant="ghost" 
                onClick={onCancel}
                type="button"
                className="text-slate-400 hover:bg-slate-800/20 hover:text-slate-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-emerald hover:bg-emerald-dark"
              >
                {isSubmitting ? "Saving..." : initialData ? "Update Goal" : "Create Goal"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ParentGoalForm;
