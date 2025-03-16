
import { Goal } from "@/components/GoalRow";
import { DragEndEvent } from '@dnd-kit/core';

export interface ParentGoal {
  id: string;
  title: string;
  description: string;
  goals: Goal[];
  position?: number;
  // Make user_id optional since the column doesn't exist yet
  user_id?: string;
}

export interface IndexPageContextType {
  // State
  parentGoals: ParentGoal[];
  isLoading: boolean;
  activeGoal: Goal | null;
  activeGoalIndices: {rowIndex: number, goalIndex: number} | null;
  showFocusTimer: boolean;
  isDialogOpen: boolean;
  goalToEdit: ParentGoal | null;
  
  // Actions
  setShowFocusTimer: (show: boolean) => void;
  handleGoalFocus: (goal: Goal, rowIndex: number, goalIndex: number) => void;
  handleStopFocus: () => void;
  handleCreateOrEditGoal: (goal: ParentGoal | null) => void;
  handleUpdateSubGoals: (parentIndex: number, updatedGoals: Goal[]) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  deleteParentGoal: (id: string) => Promise<void>;
  deleteSubGoal: (id: string, parentIndex: number) => Promise<void>;
  closeDialog: () => void;
  fetchParentGoals: () => Promise<void>;
}
