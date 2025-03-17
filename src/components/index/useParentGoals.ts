
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ParentGoal } from "./IndexPageTypes";
import { useAuth } from "@/context/AuthContext";
import { Goal } from "@/components/GoalRow";

type ParentGoalWithGoals = {
  id: string;
  title: string;
  description: string;
  position?: number;
  user_id?: string;
  goals: Goal[];
};

export function useParentGoals(goalToEdit: ParentGoal | null) {
  const [parentGoals, setParentGoals] = useState<ParentGoalWithGoals[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const fetchParentGoals = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        if (!authLoading) {
          setParentGoals([]);
        }
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('parent_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Explicitly convert data to avoid type recursion
      const transformedData = data ? data.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        position: goal.position,
        user_id: goal.user_id,
        goals: goal.id === goalToEdit?.id && goalToEdit?.goals 
          ? [...goalToEdit.goals]
          : []
      } as ParentGoalWithGoals)) : [];
      
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

  useEffect(() => {
    if (!authLoading) {
      fetchParentGoals();
    }
  }, [user, authLoading]);

  const saveParentGoalOrder = async (updatedGoals: ParentGoalWithGoals[]) => {
    try {
      // Create a simple array of objects with just id and position to avoid type issues
      const goalPositions = updatedGoals.map((goal, index) => ({
        id: goal.id,
        position: index
      }));
      
      for (let i = 0; i < goalPositions.length; i++) {
        const { error } = await supabase
          .from('parent_goals')
          .update({ 
            position: goalPositions[i].position 
          })
          .eq('id', goalPositions[i].id);
        
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

  const deleteParentGoal = async (id: string) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to delete goals.",
          variant: "destructive",
        });
        return;
      }

      const { error: subGoalError } = await supabase
        .from('sub_goals')
        .delete()
        .eq('parent_goal_id', id)
        .eq('user_id', user.id);

      if (subGoalError) throw subGoalError;
      
      const { error } = await supabase
        .from('parent_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
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

  const deleteSubGoal = async (id: string) => {
    try {
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
