
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Goal } from "./IndexPageTypes";

// Define a type for SubGoal that includes all necessary properties
export type SubGoal = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  position: number;
  progress: number; // Make this required to match Goal type
};

// Define a type for database row from Supabase
type ParentGoalRow = {
  id: string;
  title: string;
  description: string;
  position: number | null;
  created_at: string;
  updated_at: string;
  user_id?: string; // Make this optional since it might not exist in the DB yet
};

// Define a type for ParentGoal that uses the SubGoal type
export type ParentGoalWithSubGoals = {
  id: string;
  title: string;
  description: string;
  position: number;
  created_at: string;
  updated_at: string;
  goals: SubGoal[];
  user_id?: string; // Make user_id optional since we're adding it
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
      // Create query with user_id filtering if the column exists
      const { data, error } = await supabase
        .from('parent_goals')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cast the data to our ParentGoalRow type
      const typedData = data as ParentGoalRow[];
      
      // Filter goals by user_id in memory 
      const filteredData = typedData.filter(goal => {
        // If the goal has a user_id, check if it matches the current user
        if ('user_id' in goal && goal.user_id) {
          return goal.user_id === user.id;
        }
        // If there's no user_id field yet, we'll show all goals (temporary)
        return true;
      });
      
      // Transform data to include empty goals array
      const transformedData = filteredData.map(goal => ({
        ...goal,
        created_at: goal.created_at,
        updated_at: goal.updated_at,
        position: goal.position || 0,
        user_id: ('user_id' in goal) ? goal.user_id : user.id, // Set user_id if it doesn't exist
        goals: goal.id === goalToEdit?.id && goalToEdit?.goals 
          ? goalToEdit.goals
          : []
      })) as ParentGoalWithSubGoals[] || [];
      
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
    if (!user) return;
    
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
    if (!user) return;
    
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
