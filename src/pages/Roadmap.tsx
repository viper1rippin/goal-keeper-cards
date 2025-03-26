
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import AnimatedContainer from "@/components/AnimatedContainer";
import Footer from "@/components/Footer";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import RoadmapHeader from "@/components/roadmap/RoadmapHeader";
import { SubGoalTimelineItem, TimelineViewMode } from "@/components/roadmap/types";

const Roadmap = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedView, setSelectedView] = useState<TimelineViewMode>("month");
  const [timelineItems, setTimelineItems] = useState<SubGoalTimelineItem[]>([]);
  
  const handleViewChange = (view: TimelineViewMode) => {
    setSelectedView(view);
  };
  
  const handleItemsChange = (items: SubGoalTimelineItem[]) => {
    setTimelineItems(items);
  };
  
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <AnimatedContainer className="flex-1 container mx-auto px-4 py-8">
          <RoadmapHeader 
            selectedView={selectedView} 
            onViewChange={handleViewChange} 
          />
          
          <div className="mt-6">
            <RoadmapTimeline 
              items={timelineItems} 
              onItemsChange={handleItemsChange} 
              viewMode={selectedView}
            />
          </div>
        </AnimatedContainer>
        <Footer />
      </div>
    </div>
  );
};

export default Roadmap;
