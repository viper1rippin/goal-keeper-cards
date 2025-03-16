
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ParentGoal } from "./IndexPageTypes";
import { useAuth } from "@/context/AuthContext";

export function useParentGoals(goalToEdit: ParentGoal | null) {
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch parent goals from Supabase
  const fetchParentGoals = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        setParentGoals([]);
        setIsLoading(false);
        return;
      }
      
      let query = supabase
        .from('parent_goals')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });
        
      // Note: We're not filtering by user_id as it doesn't exist in the schema yet
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to include empty goals array
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
  const saveParentGoalOrder = async (updatedGoals: ParentGoal[]) => {
    try {
      // Update each goal with its new position
      for (let i = 0; i < updatedGoals.length; i++) {
        const updateData = { position: i } as any;
        
        const { error } = await supabase
          .from('parent_goals')
          .update(updateData)
          .eq('id', updatedGoals[i].id);
        
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
    try {
      // First delete all sub-goals associated with this parent goal
      const { error: subGoalError } = await supabase
        .from('sub_goals')
        .delete()
        .eq('parent_goal_id', id);
      
      if (subGoalError) throw subGoalError;
      
      // Then delete the parent goal
      const { error } = await supabase
        .from('parent_goals')
        .delete()
        .eq('id', id);
      
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
    try {
      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', id);
      
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
