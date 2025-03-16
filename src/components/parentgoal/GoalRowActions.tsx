
import React from 'react';
import { Button } from "@/components/ui/button";
import DeleteParentGoalDialog from "./DeleteParentGoalDialog";

interface GoalRowActionsProps {
  title: string;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

const GoalRowActions: React.FC<GoalRowActionsProps> = ({
  title,
  onEdit,
  onDelete
}) => {
  return (
    <div className="absolute top-0 right-0 flex space-x-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-slate-400 hover:text-white hover:bg-slate-800/30"
        onClick={onEdit}
      >
        Edit
      </Button>
      <DeleteParentGoalDialog 
        title={title}
        onDelete={onDelete}
      />
    </div>
  );
};

export default GoalRowActions;
