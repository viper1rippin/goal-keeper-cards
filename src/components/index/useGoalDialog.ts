
import { useState } from "react";
import { ParentGoalWithSubGoals } from "./useParentGoals";

export function useGoalDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<ParentGoalWithSubGoals | null>(null);
  
  // Handle creating or editing goal
  const handleCreateOrEditGoal = (goal: ParentGoalWithSubGoals | null = null) => {
    setGoalToEdit(goal);
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setGoalToEdit(null);
  };
  
  return {
    isDialogOpen,
    goalToEdit,
    handleCreateOrEditGoal,
    closeDialog
  };
}
