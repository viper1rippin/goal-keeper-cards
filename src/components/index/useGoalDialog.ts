
import { useState } from "react";
import { ParentGoal } from "@/types/goal-types";

export function useGoalDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<ParentGoal | null>(null);
  
  // Handle creating or editing goal
  const handleCreateOrEditGoal = (goal: ParentGoal | null = null) => {
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
