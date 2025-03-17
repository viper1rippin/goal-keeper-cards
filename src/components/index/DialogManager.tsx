
import React from "react";
import ParentGoalDialog from "@/components/ParentGoalDialog";
import { useIndexPage } from "./IndexPageContext";

const DialogManager: React.FC = () => {
  const {
    isDialogOpen,
    closeDialog,
    goalToEdit,
    fetchParentGoals
  } = useIndexPage();

  return (
    <ParentGoalDialog
      isOpen={isDialogOpen}
      onClose={closeDialog}
      goalToEdit={goalToEdit ? {
        id: goalToEdit.id || "",
        title: goalToEdit.title,
        description: goalToEdit.description
      } : null}
      onGoalSaved={fetchParentGoals}
    />
  );
};

export default DialogManager;
