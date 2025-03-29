
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import RoadmapSelector from '@/components/roadmap/RoadmapSelector';
import { ParentGoal } from '@/components/index/IndexPageTypes';
import { TimelineViewMode } from '@/components/roadmap/types';

interface RoadmapHeaderProps {
  selectedRoadmapId: string | null;
  onSelectRoadmap: (id: string) => void;
  parentGoals: ParentGoal[];
  selectedView: TimelineViewMode;
  onViewChange: (view: TimelineViewMode) => void;
}

const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({
  selectedRoadmapId,
  onSelectRoadmap,
  parentGoals,
  selectedView,
  onViewChange
}) => {
  const handleCreateRoadmap = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available in the next update.",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Project Roadmap</h1>
          <p className="text-slate-400 mt-1">Visualize your project timeline and milestones</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="secondary"
            onClick={() => handleCreateRoadmap()}
          >
            <Plus size={16} className="mr-1" />
            New Roadmap
          </Button>
        </div>
      </div>
      
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <RoadmapSelector 
            selectedRoadmapId={selectedRoadmapId} 
            onSelectRoadmap={onSelectRoadmap}
            parentGoals={parentGoals}
          />
          
          <div className="flex bg-slate-800/50 rounded-md p-1">
            <button 
              onClick={() => onViewChange("month")}
              className={`px-3 py-1 text-sm rounded ${selectedView === "month" ? "bg-slate-700" : "hover:bg-slate-800/80"}`}
            >
              Month
            </button>
            <button 
              onClick={() => onViewChange("year")}
              className={`px-3 py-1 text-sm rounded ${selectedView === "year" ? "bg-slate-700" : "hover:bg-slate-800/80"}`}
            >
              Year
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoadmapHeader;
