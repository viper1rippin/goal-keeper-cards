
import { useState, useCallback } from "react";
import { Goal } from "@/components/GoalRow";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ParentGoal } from "./IndexPageTypes";
import { MappedParentGoal } from "./types/goalTypes";
import { useAuthenticatedGoals } from "./hooks/useAuthenticatedGoals";
import { 
  getGuestParentGoals,
  saveGuestParentGoals,
  deleteGuestParentGoal,
  updateGuestParentGoalOrder
} from "@/utils/guestStorage";

export const useParentGoals = (goalToEdit: ParentGoal | null) => {
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get authenticated user operations
  const { 
    fetchAuthenticatedGoals, 
    saveAuthenticatedGoalOrder,
    deleteAuthenticatedParentGoal,
    deleteAuthenticatedSubGoal
  } = useAuthenticatedGoals(user?.id);

  // Function to fetch parent goals
  const fetchParentGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Handle guest mode
      if (!user) {
        const guestGoals = getGuestParentGoals();
        setParentGoals(guestGoals);
        setIsLoading(false);
        return;
      }
      
      // Handle authenticated user - fetch from supabase
      const mappedParentGoals = await fetchAuthenticatedGoals();
      setParentGoals(mappedParentGoals as ParentGoal[]);
      
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goals. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, fetchAuthenticatedGoals]);

  // Function to save parent goal order
  const saveParentGoalOrder = useCallback(async (reorderedGoals: ParentGoal[]) => {
    try {
      // Handle guest mode
      if (!user) {
        updateGuestParentGoalOrder(reorderedGoals);
        return;
      }
      
      // Handle authenticated user
      await saveAuthenticatedGoalOrder(reorderedGoals as MappedParentGoal[]);
      
    } catch (error) {
      console.error('Error updating goal order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal order. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, toast, saveAuthenticatedGoalOrder]);

  // Function to delete a parent goal
  const deleteParentGoal = useCallback(async (id: string) => {
    try {
      // Handle guest mode
      if (!user) {
        const deleted = deleteGuestParentGoal(id);
        
        if (deleted) {
          // Update state
          setParentGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
          
          toast({
            title: 'Success',
            description: 'Goal deleted successfully',
          });
        }
        return;
      }
      
      // Handle authenticated user
      const success = await deleteAuthenticatedParentGoal(id);
      
      if (success) {
        // Update state
        setParentGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
        
        toast({
          title: 'Success',
          description: 'Goal deleted successfully',
        });
      }
      
      // Refetch goals to ensure consistent state
      fetchParentGoals();
      
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete goal. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, toast, fetchParentGoals, deleteAuthenticatedParentGoal]);

  // Function to delete a sub goal
  const deleteSubGoal = useCallback(async (id: string) => {
    if (!user) {
      // For guest mode, we need parent goal id to delete sub goal
      // This will be handled by the component that calls this function
      return;
    }
    
    try {
      const success = await deleteAuthenticatedSubGoal(id);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Sub-goal deleted successfully',
        });
      }
      
    } catch (error) {
      console.error('Error deleting sub-goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete sub-goal. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, toast, deleteAuthenticatedSubGoal]);

  return {
    parentGoals,
    setParentGoals,
    isLoading,
    fetchParentGoals,
    saveParentGoalOrder,
    deleteParentGoal,
    deleteSubGoal
  };
};
