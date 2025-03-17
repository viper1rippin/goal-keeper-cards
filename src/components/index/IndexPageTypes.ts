
import { DragEndEvent } from '@dnd-kit/core';
import { ParentGoal, SubGoal } from '@/types/goal-types';

export interface IndexPageContextType {
  // State
  parentGoals: ParentGoal[];
  isLoading: boolean;
  activeGoal: SubGoal | null;
  activeGoalIndices: {rowIndex: number, goalIndex: number} | null;
  showFocusTimer: boolean;
  isDialogOpen: boolean;
  goalToEdit: ParentGoal | null;
  
  // Actions
  setShowFocusTimer: (show: boolean) => void;
  handleGoalFocus: (goal: SubGoal, rowIndex: number, goalIndex: number) => void;
  handleStopFocus: () => void;
  handleCreateOrEditGoal: (goal: ParentGoal | null) => void;
  handleUpdateSubGoals: (parentIndex: number, updatedGoals: SubGoal[]) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  deleteParentGoal: (id: string) => Promise<void>;
  deleteSubGoal: (id: string, parentIndex: number) => Promise<void>;
  closeDialog: () => void;
  fetchParentGoals: () => Promise<void>;
}

// Re-export ParentGoal for convenience
export { type ParentGoal, type SubGoal };
