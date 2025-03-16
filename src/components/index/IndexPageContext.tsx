
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
  const { parentGoals, setParentGoals, isLoading, fetchParentGoals, saveParentGoalOrder } = useParentGoals(goalToEdit);
  const { 
    activeGoal, 
    activeGoalIndices, 
    showFocusTimer, 
    setShowFocusTimer, 
    handleGoalFocus, 
    handleStopFocus,
    setActiveGoalIndices
  } = useGoalFocus();
  
  // Handle updating sub-goals for a parent goal
  const handleUpdateSubGoals = (parentIndex: number, updatedGoals: Goal[]) => {
    const updatedParentGoals = [...parentGoals];
    updatedParentGoals[parentIndex] = {
      ...updatedParentGoals[parentIndex],
      goals: updatedGoals
    };
    setParentGoals(updatedParentGoals);
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
    }
  };
  
  // Fetch goals on component mount
  useEffect(() => {
    fetchParentGoals();
  }, []);
  
  // Reset active goal if it's deleted
  useEffect(() => {
    if (activeGoalIndices && parentGoals.length > 0) {
      // Check if the active goal still exists
      const { rowIndex } = activeGoalIndices;
      if (rowIndex >= parentGoals.length) {
        // The active goal's parent has been deleted, reset the focus
        handleStopFocus();
      }
    }
  }, [parentGoals, activeGoalIndices]);

  const contextValue: IndexPageContextType = {
    // State
    parentGoals,
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
