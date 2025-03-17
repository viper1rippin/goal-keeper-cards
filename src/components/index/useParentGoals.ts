
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ParentGoal } from "./IndexPageTypes";
import { useAuth } from "@/context/AuthContext";

export function useParentGoals(goalToEdit: ParentGoal | null) {
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); // Get the current authenticated user and auth loading state
  
  // Fetch parent goals from Supabase
  const fetchParentGoals = async () => {
    setIsLoading(true);
    try {
      // Only fetch goals if user is authenticated
      if (!user) {
        // Don't clear goals if auth is still loading
        if (!authLoading) {
          setParentGoals([]);
        }
        setIsLoading(false);
        return;
      }

      // Filter goals by the current user's ID
      const { data, error } = await supabase
        .from('parent_goals')
        .select('*')
        .eq('user_id', user.id) // Filter by user_id
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
  
  // Re-fetch goals when auth state changes or is confirmed
  useEffect(() => {
    // Only fetch if authentication loading is complete
    if (!authLoading) {
      fetchParentGoals();
    }
  }, [user, authLoading]);
  
  // Save the updated order of parent goals to the database
  const saveParentGoalOrder = async (updatedGoals: ParentGoal[]) => {
    try {
      // Update each goal with its new position
      for (let i = 0; i < updatedGoals.length; i++) {
        const { error } = await supabase
          .from('parent_goals')
          .update({ 
            position: i 
          } as any)
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
      // Only proceed if user is authenticated
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to delete goals.",
          variant: "destructive",
        });
        return;
      }

      // First delete all sub-goals associated with this parent goal
      const { error: subGoalError } = await supabase
        .from('sub_goals')
        .delete()
        .eq('parent_goal_id', id)
        .eq('user_id', user.id); // Only delete user's own sub-goals
      
      if (subGoalError) throw subGoalError;
      
      // Then delete the parent goal
      const { error } = await supabase
        .from('parent_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Only delete user's own goal
      
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
      // Only proceed if user is authenticated
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to delete sub-goals.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Only delete user's own sub-goal
      
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
