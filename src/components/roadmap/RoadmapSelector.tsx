
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface RoadmapSelectorProps {
  selectedRoadmapId: string | null;
  onSelectRoadmap: (id: string) => void;
}

const RoadmapSelector: React.FC<RoadmapSelectorProps> = ({ 
  selectedRoadmapId, 
  onSelectRoadmap 
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-slate-300">Select Roadmap</label>
      <Select 
        value={selectedRoadmapId || undefined} 
        onValueChange={onSelectRoadmap}
      >
        <SelectTrigger className="w-64 bg-slate-800/80 border-slate-700">
          <SelectValue placeholder="Select a roadmap" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="demo">Product Roadmap 2024</SelectItem>
          <SelectItem value="mobile">Mobile App Development</SelectItem>
          <SelectItem value="website">Website Redesign</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoadmapSelector;
