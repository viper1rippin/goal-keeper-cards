
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import AnimatedContainer from "@/components/AnimatedContainer";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import RoadmapSelector from "@/components/roadmap/RoadmapSelector";
import { SubGoalTimelineItem } from "@/components/roadmap/types";
import StarsBackground from "@/components/effects/StarsBackground";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Roadmap = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>("demo");
  const [selectedView, setSelectedView] = useState<"day" | "week" | "month" | "year">("month");
  
  // Sample roadmap data - in real app this would come from API
  const sampleItems: SubGoalTimelineItem[] = [
    {
      id: "1",
      title: "Research Phase",
      description: "Initial market research and competitor analysis",
      row: 0,
      start: 1,
      duration: 3,
      progress: 70,
      category: "research"
    },
    {
      id: "2",
      title: "Design Prototypes",
      description: "Create wireframes and interactive prototypes",
      row: 1,
      start: 3,
      duration: 2,
      progress: 40,
      category: "design"
    },
    {
      id: "3",
      title: "MVP Development",
      description: "Develop minimum viable product features",
      row: 2,
      start: 4,
      duration: 4,
      progress: 20,
      category: "development"
    },
    {
      id: "4",
      title: "Alpha Testing",
      description: "Internal testing phase",
      row: 0,
      start: 6,
      duration: 2,
      progress: 0,
      category: "testing"
    },
    {
      id: "5",
      title: "Beta Release",
      description: "Limited user testing",
      row: 1,
      start: 7,
      duration: 3,
      progress: 0,
      category: "milestone"
    }
  ];
  
  const [roadmapItems, setRoadmapItems] = useState<SubGoalTimelineItem[]>(sampleItems);
  
  const handleItemsChange = (updatedItems: SubGoalTimelineItem[]) => {
    setRoadmapItems(updatedItems);
    // In a real app, we would save to database here
    toast({
      title: "Roadmap updated",
      description: "Your changes have been saved.",
    });
  };
  
  const handleCreateRoadmap = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available in the next update.",
    });
  };
  
  const handleViewChange = (view: "day" | "week" | "month" | "year") => {
    setSelectedView(view);
  };
  
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Stars background */}
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
                onSelectRoadmap={setSelectedRoadmapId}
              />
              
              <div className="flex bg-slate-800/50 rounded-md p-1">
                <button 
                  onClick={() => handleViewChange("day")}
                  className={`px-3 py-1 text-sm rounded ${selectedView === "day" ? "bg-slate-700" : "hover:bg-slate-800/80"}`}
                >
                  Day
                </button>
                <button 
                  onClick={() => handleViewChange("week")}
                  className={`px-3 py-1 text-sm rounded ${selectedView === "week" ? "bg-slate-700" : "hover:bg-slate-800/80"}`}
                >
                  Week
                </button>
                <button 
                  onClick={() => handleViewChange("month")}
                  className={`px-3 py-1 text-sm rounded ${selectedView === "month" ? "bg-slate-700" : "hover:bg-slate-800/80"}`}
                >
                  Month
                </button>
                <button 
                  onClick={() => handleViewChange("year")}
                  className={`px-3 py-1 text-sm rounded ${selectedView === "year" ? "bg-slate-700" : "hover:bg-slate-800/80"}`}
                >
                  Year
                </button>
              </div>
            </div>
          </div>
          
          <RoadmapTimeline
            roadmapId={selectedRoadmapId || "demo"}
            items={roadmapItems}
            onItemsChange={handleItemsChange}
            viewMode={selectedView}
          />
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default Roadmap;
