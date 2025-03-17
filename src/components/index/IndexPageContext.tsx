
import React, { createContext, useContext, useEffect, useState } from "react";
import { Goal } from "@/components/GoalRow";
import { useToast } from "@/hooks/use-toast";
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { IndexPageContextType, ParentGoal } from "./IndexPageTypes";
import { useParentGoals } from "./useParentGoals";
import { useGoalFocus } from "./useGoalFocus";
import { useGoalDialog } from "./useGoalDialog";
import { SUBSCRIPTION_TIERS } from "@/utils/subscriptionUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const IndexPageContext = createContext<IndexPageContextType | undefined>(undefined);

export const IndexPageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isPatriot, setIsPatriot] = useState(false);
  const [userSubscriptionTier, setUserSubscriptionTier] = useState(SUBSCRIPTION_TIERS.FREE);
  
  // Use our custom hooks
  const { isDialogOpen, goalToEdit, handleCreateOrEditGoal, closeDialog } = useGoalDialog();
  const { 
    parentGoals, 
    setParentGoals, 
    isLoading, 
    fetchParentGoals, 
    saveParentGoalOrder,
    deleteParentGoal: deleteParentGoalFromSupabase,
    deleteSubGoal: deleteSubGoalFromSupabase,
    subscriptionTier,
    canAddParentGoal
  } = useParentGoals(goalToEdit);
  
  const { 
    activeGoal, 
    activeGoalIndices, 
    showFocusTimer, 
    setShowFocusTimer, 
    handleGoalFocus, 
    handleStopFocus,
    setActiveGoalIndices
  } = useGoalFocus();
  
  // Fetch user's subscription info
  useEffect(() => {
    if (user) {
      const fetchUserSubscription = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('is_patriot, subscription_tier')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data) {
          setIsPatriot(data.is_patriot || false);
          setUserSubscriptionTier(data.subscription_tier || SUBSCRIPTION_TIERS.FREE);
        }
      };
      
      fetchUserSubscription();
      
      // Subscribe to changes
      const channel = supabase
        .channel('subscription-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new) {
              setIsPatriot(payload.new.is_patriot || false);
              setUserSubscriptionTier(payload.new.subscription_tier || SUBSCRIPTION_TIERS.FREE);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
  // Handle creating or editing a goal, with subscription limits
  const handleCreateOrEditGoalWithLimits = (goal: ParentGoal | null) => {
    // If user is trying to create a new goal, check limits
    if (!goal && !canAddParentGoal()) {
      toast({
        title: 'Subscription Limit Reached',
        description: 'Upgrade to Premium to create unlimited goals!',
        variant: 'destructive',
      });
      return;
    }
    
    // Allow editing existing goals regardless of limits
    handleCreateOrEditGoal(goal);
  };
  
  // Handle deleting a parent goal
  const deleteParentGoal = async (id: string) => {
    // If the active goal belongs to this parent, clear it
    if (activeGoalIndices && parentGoals[activeGoalIndices.rowIndex]?.id === id) {
      handleStopFocus();
    }
    
    await deleteParentGoalFromSupabase(id);
  };
  
  // Handle deleting a sub-goal
  const deleteSubGoal = async (id: string, parentIndex: number) => {
    // Clear active goal if it's being deleted
    if (activeGoalIndices && 
        activeGoalIndices.rowIndex === parentIndex && 
        parentGoals[parentIndex]?.goals[activeGoalIndices.goalIndex]?.id === id) {
      handleStopFocus();
    }
    
    // Delete from Supabase
    await deleteSubGoalFromSupabase(id);
    
    // Update local state
    const updatedParentGoals = [...parentGoals];
    const parentGoal = updatedParentGoals[parentIndex];
    
    if (parentGoal) {
      parentGoal.goals = parentGoal.goals.filter(goal => goal.id !== id);
      setParentGoals(updatedParentGoals as any);
    }
  };
  
  // Handle updating sub-goals for a parent goal
  const handleUpdateSubGoals = (parentIndex: number, updatedGoals: Goal[]) => {
    const updatedParentGoals = [...parentGoals];
    if (updatedParentGoals[parentIndex]) {
      updatedParentGoals[parentIndex] = {
        ...updatedParentGoals[parentIndex],
        goals: updatedGoals
      };
      setParentGoals(updatedParentGoals as any);
    }
  };
  
  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      setParentGoals((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        // Update parent goal indices in activeGoalIndices if needed
        if (activeGoalIndices) {
          const { rowIndex, goalIndex } = activeGoalIndices;
          if (rowIndex === oldIndex) {
            setActiveGoalIndices({
              rowIndex: newIndex,
              goalIndex
            });
          } else if (rowIndex > oldIndex && rowIndex <= newIndex) {
            setActiveGoalIndices({
              rowIndex: rowIndex - 1,
              goalIndex
            });
          } else if (rowIndex < oldIndex && rowIndex >= newIndex) {
            setActiveGoalIndices({
              rowIndex: rowIndex + 1,
              goalIndex
            });
          }
        }
        
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        
        // Save the new order to the database
        saveParentGoalOrder(reorderedItems);
        
        return reorderedItems;
      });
      
      toast({
        title: "Success",
        description: "Goal order updated",
      });
    }
  };
  
  // Fetch goals on component mount
  useEffect(() => {
    fetchParentGoals();
  }, [fetchParentGoals]);

  const contextValue: IndexPageContextType = {
    // State
    parentGoals: parentGoals as ParentGoal[],
    isLoading,
    activeGoal,
    activeGoalIndices,
    showFocusTimer,
    isDialogOpen,
    goalToEdit,
    isPatriot,
    subscriptionTier: userSubscriptionTier,
    canAddParentGoal,
    
    // Actions
    setShowFocusTimer,
    handleGoalFocus,
    handleStopFocus,
    handleCreateOrEditGoal: handleCreateOrEditGoalWithLimits,
    handleUpdateSubGoals,
    handleDragEnd,
    deleteParentGoal,
    deleteSubGoal,
    closeDialog,
    fetchParentGoals
  };

  return (
    <IndexPageContext.Provider value={contextValue}>
      {children}
    </IndexPageContext.Provider>
  );
};

export const useIndexPage = () => {
  const context = useContext(IndexPageContext);
  if (context === undefined) {
    throw new Error("useIndexPage must be used within a IndexPageProvider");
  }
  return context;
};

export { type ParentGoal };
