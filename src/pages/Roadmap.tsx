
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import AnimatedContainer from "@/components/AnimatedContainer";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import RoadmapSelector from "@/components/roadmap/RoadmapSelector";
import { SubGoalTimelineItem, TimelineViewMode, TimelineCategory } from "@/components/roadmap/types";
import StarsBackground from "@/components/effects/StarsBackground";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Roadmap = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>("demo");
  const [selectedView, setSelectedView] = useState<TimelineViewMode>("month");
  
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
      category: "research",
      startDate: new Date(new Date().setDate(new Date().getDate() - 10)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 20))
    },
    {
      id: "2",
      title: "Design Prototypes",
      description: "Create wireframes and interactive prototypes",
      row: 1,
      start: 3,
      duration: 2,
      progress: 40,
      category: "design",
      startDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30))
    },
    {
      id: "3",
      title: "MVP Development",
      description: "Develop minimum viable product features",
      row: 2,
      start: 4,
      duration: 4,
      progress: 20,
      category: "development",
      startDate: new Date(new Date().setDate(new Date().getDate() + 25)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 65))
    },
    {
      id: "4",
      title: "Alpha Testing",
      description: "Internal testing phase",
      row: 0,
      start: 6,
      duration: 2,
      progress: 0,
      category: "testing",
      startDate: new Date(new Date().setDate(new Date().getDate() + 70)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 85))
    },
    {
      id: "5",
      title: "Beta Release",
      description: "Limited user testing",
      row: 1,
      start: 7,
      duration: 3,
      progress: 0,
      category: "milestone",
      startDate: new Date(new Date().setDate(new Date().getDate() + 90)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 120))
    }
  ];
  
  const [roadmapItems, setRoadmapItems] = useState<SubGoalTimelineItem[]>(sampleItems);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load roadmap data from database
  useEffect(() => {
    if (selectedRoadmapId && selectedRoadmapId !== "demo" && user) {
      loadRoadmapData(selectedRoadmapId);
    } else if (selectedRoadmapId === "demo") {
      setRoadmapItems(sampleItems);
    }
  }, [selectedRoadmapId, user]);
  
  // Function to load roadmap data
  const loadRoadmapData = async (roadmapId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('sub_goals')
        .select('*')
        .eq('parent_goal_id', roadmapId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map database fields to timeline items
        const items: SubGoalTimelineItem[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          row: item.timeline_row || 0,
          start: item.timeline_start || 0,
          duration: item.timeline_duration || 2,
          progress: item.progress,
          category: (item.timeline_category as TimelineCategory) || 'default',
          parentId: item.parent_goal_id,
          startDate: item.start_date ? new Date(item.start_date) : null,
          endDate: item.end_date ? new Date(item.end_date) : null
        }));
        
        setRoadmapItems(items);
      } else {
        // No items found, use empty array
        setRoadmapItems([]);
      }
      
    } catch (error) {
      console.error("Error loading roadmap data:", error);
      toast({
        title: "Error loading roadmap",
        description: "There was a problem loading your roadmap data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleItemsChange = async (updatedItems: SubGoalTimelineItem[]) => {
    setRoadmapItems(updatedItems);
    
    // In a real app, save to database here
    if (user && selectedRoadmapId && selectedRoadmapId !== "demo") {
      try {
        const updates = updatedItems.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          progress: item.progress,
          parent_goal_id: selectedRoadmapId,
          user_id: user.id,
          timeline_row: item.row,
          timeline_start: item.start,
          timeline_duration: item.duration,
          timeline_category: item.category,
          start_date: item.startDate instanceof Date ? item.startDate.toISOString() : item.startDate,
          end_date: item.endDate instanceof Date ? item.endDate.toISOString() : item.endDate
        }));
        
        // Batch update all items
        for (const update of updates) {
          if (update.id.startsWith('item-')) {
            // New item - remove temp id and insert
            const { id, ...newItem } = update;
            const { error } = await supabase
              .from('sub_goals')
              .insert(newItem);
              
            if (error) throw error;
          } else {
            // Existing item - update
            const { error } = await supabase
              .from('sub_goals')
              .update(update)
              .eq('id', update.id)
              .eq('user_id', user.id);
              
            if (error) throw error;
          }
        }
        
        toast({
          title: "Roadmap updated",
          description: "Your changes have been saved.",
        });
        
      } catch (error) {
        console.error("Error saving roadmap data:", error);
        toast({
          title: "Error saving roadmap",
          description: "There was a problem saving your changes.",
          variant: "destructive"
        });
      }
    } else {
      // Demo mode - just show toast
      toast({
        title: "Roadmap updated",
        description: "Your changes have been saved.",
      });
    }
  };
  
  const handleCreateRoadmap = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available in the next update.",
    });
  };
  
  const handleViewChange = (view: TimelineViewMode) => {
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
          
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald"></div>
            </div>
          ) : (
            <RoadmapTimeline
              roadmapId={selectedRoadmapId || "demo"}
              items={roadmapItems}
              onItemsChange={handleItemsChange}
              viewMode={selectedView}
            />
          )}
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default Roadmap;
