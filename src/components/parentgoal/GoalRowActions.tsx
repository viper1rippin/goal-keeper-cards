
import React from 'react';
import { Button } from "@/components/ui/button";

interface GoalRowActionsProps {
  onEdit: () => void;
  onDelete?: () => Promise<void>;
  title?: string;
}

const GoalRowActions: React.FC<GoalRowActionsProps> = ({
  onEdit,
  onDelete,
  title
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
    </div>
  );
};

export default GoalRowActions;
