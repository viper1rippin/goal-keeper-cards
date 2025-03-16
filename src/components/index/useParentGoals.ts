
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Define a simplified type for SubGoal that doesn't create circular references
type SubGoal = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  position: number;
};

// Define a type for ParentGoal that uses the simplified SubGoal type
export type ParentGoalWithSubGoals = {
  id: string;
  title: string;
  description: string;
  position: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  goals: SubGoal[];
};

export function useParentGoals(goalToEdit: ParentGoalWithSubGoals | null) {
  const [parentGoals, setParentGoals] = useState<ParentGoalWithSubGoals[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch parent goals from Supabase
  const fetchParentGoals = async () => {
    if (!user) {
      setIsLoading(false);
      return; // Don't fetch if not authenticated
    }
    
    setIsLoading(true);
    try {
      // Create query
      let query = supabase
        .from('parent_goals')
        .select('*')
        .eq('user_id', user.id);
      
      // Add ordering
      const { data, error } = await query
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include empty goals array if no data
      const transformedData = data?.map(goal => ({
        ...goal,
        goals: goal.id === goalToEdit?.id && goalToEdit?.goals 
          ? goalToEdit.goals
          : []
      })) || [];
      
      setParentGoals(transformedData);
    } catch (error) {
      console.error("Error fetching parent goals:", error);
      toast({
        title: "Error",
        description: "Failed to load your goals. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save the updated order of parent goals to the database
  const saveParentGoalOrder = async (updatedGoals: ParentGoalWithSubGoals[]) => {
    if (!user) return;
    
    try {
      // Update each goal with its new position
      for (let i = 0; i < updatedGoals.length; i++) {
        const { error } = await supabase
          .from('parent_goals')
          .update({ position: i })
          .eq('id', updatedGoals[i].id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving goal order:", error);
      toast({
        title: "Error",
        description: "Failed to save goal order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete a parent goal
  const deleteParentGoal = async (id: string) => {
    if (!user) return;
    
    try {
      // First delete all sub-goals associated with this parent goal
      const { error: subGoalError } = await supabase
        .from('sub_goals')
        .delete()
        .eq('parent_goal_id', id)
        .eq('user_id', user.id);
      
      if (subGoalError) throw subGoalError;
      
      // Then delete the parent goal
      const { error } = await supabase
        .from('parent_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setParentGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
      
      toast({
        title: "Goal Deleted",
        description: "The goal and all its sub-goals have been deleted.",
      });
    } catch (error) {
      console.error("Error deleting parent goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete the goal. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Delete a sub-goal
  const deleteSubGoal = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Sub-Goal Deleted",
        description: "The sub-goal has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting sub-goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete the sub-goal. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return {
    parentGoals,
    setParentGoals,
    isLoading,
    fetchParentGoals,
    saveParentGoalOrder,
    deleteParentGoal,
    deleteSubGoal
  };
}
