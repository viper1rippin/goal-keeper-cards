
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ParentGoal } from "@/components/index/IndexPageTypes";

interface ParentGoalSelectorProps {
  parentGoals: ParentGoal[];
  onSelect: (id: string) => void;
}

const ParentGoalSelector = ({ parentGoals, onSelect }: ParentGoalSelectorProps) => {
  if (parentGoals.length === 0) {
    return (
      <div className="text-sm text-slate-400">
        No parent goals available to import
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <Select
        onValueChange={(value) => onSelect(value)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select a parent goal" />
        </SelectTrigger>
        <SelectContent>
          {parentGoals.map((goal) => (
            <SelectItem key={goal.id} value={goal.id}>
              {goal.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ParentGoalSelector;
