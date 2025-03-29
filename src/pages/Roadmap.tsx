
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import AnimatedContainer from "@/components/AnimatedContainer";
import { TimelineViewMode } from "@/components/roadmap/types";
import StarsBackground from "@/components/effects/StarsBackground";
import { toast } from "@/components/ui/use-toast";
import RoadmapHeader from "@/components/roadmap/RoadmapHeader";
import RoadmapContent from "@/components/roadmap/RoadmapContent";
import { useRoadmapData } from "@/components/roadmap/hooks/useRoadmapData";
import { useRoadmapItemsChange } from "@/components/roadmap/hooks/useRoadmapItemsChange";

const Roadmap = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedView, setSelectedView] = useState<TimelineViewMode>("month");
  
  const {
    parentGoals,
    selectedRoadmapId,
    setSelectedRoadmapId,
    roadmapItems,
    setRoadmapItems,
    isLoading
  } = useRoadmapData();
  
  const { handleItemsChange } = useRoadmapItemsChange();
  
  const handleViewChange = (view: "month" | "year") => {
    setSelectedView(view);
  };
  
  const handleImportSubGoals = (parentId: string) => {
    toast({
      title: "Coming Soon",
      description: "Importing sub-goals will be available in the next update.",
    });
  };
  
  const onItemsChange = async (updatedItems) => {
    const newItems = await handleItemsChange(updatedItems, roadmapItems, selectedRoadmapId);
    setRoadmapItems(updatedItems);
  };
  
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <StarsBackground />
      </div>
      
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <AnimatedContainer 
        animation="fade-in" 
        className={`flex-1 min-h-screen pb-16 bg-slate-950/95 backdrop-blur-sm transition-all z-10 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="container pt-8 pb-16 relative z-10">
          <RoadmapHeader
            selectedRoadmapId={selectedRoadmapId}
            onSelectRoadmap={setSelectedRoadmapId}
            parentGoals={parentGoals}
            selectedView={selectedView}
            onViewChange={handleViewChange}
          />
          
          <RoadmapContent
            isLoading={isLoading}
            selectedRoadmapId={selectedRoadmapId}
            roadmapItems={roadmapItems}
            onItemsChange={onItemsChange}
            viewMode={selectedView}
          />
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default Roadmap;
