
import { Goal } from "@/components/GoalRow";
import { DragEndEvent } from "@dnd-kit/core";
import { ParentGoalWithSubGoals } from "./useParentGoals";

export interface IndexPageContextType {
  // State
  parentGoals: ParentGoalWithSubGoals[];
  isLoading: boolean;
  activeGoal: Goal | null;
  activeGoalIndices: { rowIndex: number; goalIndex: number } | null;
  showFocusTimer: boolean;
  isDialogOpen: boolean;
  goalToEdit: ParentGoalWithSubGoals | null;
  
  // Actions
  setShowFocusTimer: (show: boolean) => void;
  handleGoalFocus: (goal: Goal, rowIndex: number, goalIndex: number) => void;
  handleStopFocus: () => void;
  handleCreateOrEditGoal: (goal?: ParentGoalWithSubGoals | null) => void;
  handleUpdateSubGoals: (parentIndex: number, updatedGoals: Goal[]) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  deleteParentGoal: (id: string) => Promise<void>;
  deleteSubGoal: (id: string, parentIndex: number) => Promise<void>;
  closeDialog: () => void;
  fetchParentGoals: () => Promise<void>;
}
