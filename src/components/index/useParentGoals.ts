
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ParentGoal } from "./IndexPageTypes";
import { useAuth } from "@/context/AuthContext";
import { Goal } from "../GoalRow";

// Define explicit types to avoid deep instantiation errors
type ParentGoalDB = {
  id: string;
  title: string;
  description: string;
  position: number;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export function useParentGoals(goalToEdit: ParentGoal | null) {
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch parent goals from Supabase
  const fetchParentGoals = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('parent_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include empty goals array if no data
      const transformedData = (data as ParentGoalDB[] || []).map((goal: ParentGoalDB) => ({
        ...goal,
        goals: goal.id === goalToEdit?.id && goalToEdit?.goals 
          ? goalToEdit.goals
          : []
      }));
      
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
        .eq('parent_goal_id', id);
      
      if (subGoalError) throw subGoalError;
      
      // Then delete the parent goal (ensure it belongs to the current user)
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
  
  // Delete a sub-goal (add user verification when possible)
  const deleteSubGoal = async (id: string) => {
    if (!user) return;
    
    try {
      // Ideally, we should check that this sub-goal belongs to a parent goal
      // that belongs to the current user, but that requires a more complex query
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
