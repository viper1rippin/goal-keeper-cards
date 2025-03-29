
import React from 'react';
import RoadmapTimeline from '@/components/roadmap/RoadmapTimeline';
import { SubGoalTimelineItem, TimelineViewMode } from '@/components/roadmap/types';

interface RoadmapContentProps {
  isLoading: boolean;
  selectedRoadmapId: string | null;
  roadmapItems: SubGoalTimelineItem[];
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
  viewMode: TimelineViewMode;
}

const RoadmapContent: React.FC<RoadmapContentProps> = ({
  isLoading,
  selectedRoadmapId,
  roadmapItems,
  onItemsChange,
  viewMode
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-lg p-8 text-center">
        <p className="text-slate-400">Loading roadmap data...</p>
      </div>
    );
  }
  
  if (!selectedRoadmapId) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-lg p-8 text-center">
        <p className="text-slate-400">Select a parent goal to view its roadmap</p>
      </div>
    );
  }
  
  return (
    <RoadmapTimeline
      roadmapId={selectedRoadmapId}
      items={roadmapItems}
      onItemsChange={onItemsChange}
      viewMode={viewMode}
    />
  );
};

export default RoadmapContent;
