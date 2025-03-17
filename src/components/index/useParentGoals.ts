
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Goal } from "@/components/GoalRow";
import type { ParentGoal } from "./IndexPageTypes";
import { useAuth } from "@/context/AuthContext";

// Define a more explicit interface for the data from Supabase
interface ParentGoalRecord {
  id: string;
  title: string;
  description: string;
  user_id: string;
  position?: number;
  order?: number;
  created_at?: string;
  updated_at?: string;
  sub_goals?: {
    id: string;
    title: string;
    description: string;
    progress: number;
    parent_goal_id: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
  }[];
  [key: string]: any;
}

export function useParentGoals(goalToEdit: ParentGoal | null) {
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const fetchParentGoals = async () => {
    try {
      if (!user) {
        setParentGoals([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase
        .from('parent_goals')
        .select(`
          *,
          sub_goals(*)
        `)
        .eq('user_id', user.id)
        .order('order');

      if (error) throw error;

      // Use a type assertion to help TypeScript understand the structure
      const typedData = data as ParentGoalRecord[];
      
      const transformedData = (typedData || []).map((goal: ParentGoalRecord) => {
        return {
          ...goal,
          goals: goal.id === goalToEdit?.id && goalToEdit?.goals 
            ? goalToEdit.goals 
            : (goal.sub_goals || []).map((subGoal) => ({
                id: subGoal.id,
                title: subGoal.title,
                description: subGoal.description,
                progress: subGoal.progress || 0,
              }))
        } as ParentGoal;
      });

      setParentGoals(transformedData);
    } catch (error) {
      console.error("Error fetching parent goals:", error);
      toast({
        title: "Error",
        description: "Could not fetch goals. Please try again later.",
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

  const saveParentGoalOrder = async (updatedGoals: ParentGoal[]) => {
    try {
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
