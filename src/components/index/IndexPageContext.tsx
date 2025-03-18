
import React, { createContext, useContext, useEffect } from "react";
import { Goal } from "@/components/GoalRow";
import { useToast } from "@/hooks/use-toast";
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { IndexPageContextType, ParentGoal } from "./IndexPageTypes";
import { useParentGoals } from "./useParentGoals";
import { useGoalFocus } from "./useGoalFocus";
import { useGoalDialog } from "./useGoalDialog";

const IndexPageContext = createContext<IndexPageContextType | undefined>(undefined);

export const IndexPageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Use our custom hooks
  const { isDialogOpen, goalToEdit, handleCreateOrEditGoal, closeDialog } = useGoalDialog();
  const { 
    parentGoals, 
    setParentGoals, 
    isLoading, 
    fetchParentGoals, 
    saveParentGoalOrder,
    deleteParentGoal: deleteParentGoalFromSupabase,
    deleteSubGoal: deleteSubGoalFromSupabase
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
  }, []);

  const contextValue: IndexPageContextType = {
    // State
    parentGoals: parentGoals as ParentGoal[],
    isLoading,
    activeGoal,
    activeGoalIndices,
    showFocusTimer,
    isDialogOpen,
    goalToEdit,
    
    // Actions
    setShowFocusTimer,
    handleGoalFocus,
    handleStopFocus,
    handleCreateOrEditGoal,
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
