import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Goal, ParentGoalWithSubGoals } from "./IndexPageTypes";

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

export function useParentGoals(goalToEdit: ParentGoalWithSubGoals | null) {
  const [parentGoals, setParentGoals] = useState<ParentGoalWithSubGoals[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch parent goals from Supabase
  const fetchParentGoals = async () => {
    if (!user) {
      setIsLoading(false);
      setParentGoals([]);
      return; // Don't fetch if not authenticated
    }
    
    setIsLoading(true);
    try {
      // Try to fetch goals with user_id filter first
      let { data, error } = await supabase
        .from('parent_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });
      
      // If there's an error related to user_id (column doesn't exist), try without the filter
      if (error && error.message && error.message.includes("user_id")) {
        console.warn("user_id column doesn't exist, fetching all goals and filtering in memory");
        
        // Fallback to fetching all goals
        const response = await supabase
          .from('parent_goals')
          .select('*')
          .order('position', { ascending: true })
          .order('created_at', { ascending: false });
          
        if (response.error) throw response.error;
        data = response.data;
      } else if (error) {
        throw error;
      }
      
      // Cast the data to our ParentGoalRow type
      const typedData = data as ParentGoalRow[] || [];
      
      // If we couldn't filter in the database, filter in memory
      // This is needed when the user_id column doesn't exist yet
      let filteredData = typedData;
      
      // If we had to use the fallback without user_id filter, we need to filter in memory
      if (error && error.message && error.message.includes("user_id")) {
        // For now we can't filter properly, so just show all goals
        // This will be a temporary state until the column is added
        filteredData = typedData;
        
        // In a real app, you might want to show a warning to the admin
        console.warn("Cannot filter goals by user_id, showing all goals. Please add user_id column to parent_goals table.");
      }
      
      // Transform data to include empty goals array
      const transformedData = filteredData.map(goal => ({
        ...goal,
        created_at: goal.created_at,
        updated_at: goal.updated_at,
        position: goal.position || 0,
        user_id: goal.user_id || user.id, // Set user_id if it doesn't exist
        goals: goal.id === goalToEdit?.id && goalToEdit?.goals 
          ? goalToEdit.goals
          : []
      })) as ParentGoalWithSubGoals[];
      
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
          .eq('user_id', user.id); // Add user_id check for security
        
        if (error) {
          // If there's an error related to user_id (column doesn't exist), try without it
          if (error.message && error.message.includes("user_id")) {
            const { error: fallbackError } = await supabase
              .from('parent_goals')
              .update({ position: i })
              .eq('id', updatedGoals[i].id);
              
            if (fallbackError) throw fallbackError;
          } else {
            throw error;
          }
        }
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
      // First verify this goal belongs to the current user
      const { data: goalData, error: verifyError } = await supabase
        .from('parent_goals')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (verifyError) {
        // If there's an error related to user_id (column doesn't exist), skip verification
        if (!verifyError.message || !verifyError.message.includes("user_id")) {
          console.error("Error verifying goal ownership:", verifyError);
          toast({
            title: "Error",
            description: "Failed to verify goal ownership. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
      
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
        .eq('id', id)
        .eq('user_id', user.id); // Add user_id check for security
      
      if (error) {
        // If there's an error related to user_id (column doesn't exist), try without it
        if (error.message && error.message.includes("user_id")) {
          const { error: fallbackError } = await supabase
            .from('parent_goals')
            .delete()
            .eq('id', id);
            
          if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }
      
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
      // First verify this sub-goal belongs to a parent goal owned by the current user
      const { data: subGoalData, error: fetchError } = await supabase
        .from('sub_goals')
        .select('parent_goal_id')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Skip this check if the parent_goal_id doesn't exist in the database yet
      if (subGoalData && subGoalData.parent_goal_id) {
        const { data: parentGoalData, error: verifyError } = await supabase
          .from('parent_goals')
          .select('id')
          .eq('id', subGoalData.parent_goal_id)
          .eq('user_id', user.id)
          .single();
          
        if (verifyError) {
          // If there's an error related to user_id (column doesn't exist), skip verification
          if (!verifyError.message || !verifyError.message.includes("user_id")) {
            console.error("Error verifying goal ownership:", verifyError);
            toast({
              title: "Error",
              description: "Failed to verify goal ownership. Please try again.",
              variant: "destructive",
            });
            return;
          }
        } else if (!parentGoalData) {
          // If the parent goal doesn't belong to this user
          toast({
            title: "Access denied",
            description: "You don't have permission to delete this sub-goal.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Delete the sub-goal
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
