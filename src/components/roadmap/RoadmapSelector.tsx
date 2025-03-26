
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ParentGoal } from "@/components/index/IndexPageTypes";

interface RoadmapSelectorProps {
  selectedRoadmapId: string | null;
  onSelectRoadmap: (id: string) => void;
  parentGoals: ParentGoal[];
}

const RoadmapSelector = ({ selectedRoadmapId, onSelectRoadmap, parentGoals }: RoadmapSelectorProps) => {
  if (parentGoals.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">Roadmap:</span>
        <div className="text-sm text-slate-400 bg-slate-800 px-3 py-2 rounded">
          No roadmaps available
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Roadmap:</span>
      <Select
        value={selectedRoadmapId || undefined}
        onValueChange={(value) => onSelectRoadmap(value)}
      >
        <SelectTrigger className="w-[220px] bg-slate-800 border-slate-700">
          <SelectValue placeholder="Select a roadmap" />
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

export default RoadmapSelector;
