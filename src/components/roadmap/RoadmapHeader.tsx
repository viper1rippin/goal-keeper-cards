
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimelineViewMode } from "./types";

interface RoadmapHeaderProps {
  selectedView: TimelineViewMode;
  onViewChange: (view: TimelineViewMode) => void;
}

const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({ 
  selectedView, 
  onViewChange 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Project Roadmap</h1>
        <p className="text-slate-400">Plan your project timeline like a music composer</p>
      </div>
      
      <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/60 backdrop-blur-sm p-4 rounded-lg border border-slate-800">
        <Tabs 
          defaultValue={selectedView} 
          onValueChange={(value) => onViewChange(value as TimelineViewMode)}
        >
          <TabsList className="bg-slate-800/50">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default RoadmapHeader;
