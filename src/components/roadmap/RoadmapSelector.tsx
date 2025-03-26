
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoadmapSelectorProps {
  selectedRoadmapId: string | null;
  onSelectRoadmap: (id: string) => void;
}

const RoadmapSelector = ({ selectedRoadmapId, onSelectRoadmap }: RoadmapSelectorProps) => {
  // Sample roadmap options - in a real app these would come from API
  const roadmapOptions = [
    { id: "demo", name: "Product Roadmap 2024" },
    { id: "mobile", name: "Mobile App Development" },
    { id: "website", name: "Website Redesign" },
  ];
  
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
          {roadmapOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoadmapSelector;
