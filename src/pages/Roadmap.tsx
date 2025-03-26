
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import AnimatedContainer from "@/components/AnimatedContainer";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import RoadmapSelector from "@/components/roadmap/RoadmapSelector";
import ParentGoalSelector from "@/components/roadmap/ParentGoalSelector";
import { SubGoalTimelineItem, TimelineViewMode } from "@/components/roadmap/types";
import StarsBackground from "@/components/effects/StarsBackground";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ParentGoal } from "@/components/index/IndexPageTypes";
import { Goal } from "@/components/GoalRow";

const Roadmap = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<TimelineViewMode>("month");
  const [roadmapItems, setRoadmapItems] = useState<SubGoalTimelineItem[]>([]);
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch parent goals
  useEffect(() => {
    const fetchParentGoals = async () => {
      if (!user) {
        setParentGoals([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch parent goals
        const { data: parentGoalsData, error: parentGoalsError } = await supabase
          .from('parent_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('position', { ascending: true });
        
        if (parentGoalsError) throw parentGoalsError;
        
        if (parentGoalsData && parentGoalsData.length > 0) {
          const formattedParentGoals: ParentGoal[] = parentGoalsData.map(pg => ({
            id: pg.id,
            title: pg.title,
            description: pg.description,
            goals: [],
            position: pg.position || 0
          }));
          
          setParentGoals(formattedParentGoals);
          
          // Set first parent goal as selected by default if none is selected
          if (!selectedRoadmapId) {
            setSelectedRoadmapId(formattedParentGoals[0].id);
          }
        }
        
      } catch (error) {
        console.error('Error fetching parent goals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load parent goals. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParentGoals();
  }, [user]);
  
  // Fetch sub-goals for the selected parent goal
  useEffect(() => {
    const fetchSubGoals = async () => {
      if (!user || !selectedRoadmapId) {
        setRoadmapItems([]);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch sub-goals for the selected parent goal
        const { data: subGoalsData, error: subGoalsError } = await supabase
          .from('sub_goals')
          .select('*')
          .eq('parent_goal_id', selectedRoadmapId)
          .eq('user_id', user.id)
          .order('display_order', { ascending: true });
        
        if (subGoalsError) throw subGoalsError;
        
        if (subGoalsData) {
          // Convert sub-goals to timeline items
          const items: SubGoalTimelineItem[] = subGoalsData.map((subGoal, index) => ({
            id: subGoal.id,
            title: subGoal.title,
            description: subGoal.description,
            row: Math.floor(index / 3), // Simple row distribution
            start: index * 3, // Spread items out for better visibility
            duration: 2, // Default duration
            progress: subGoal.progress || 0,
            category: index % 5 === 0 ? 'milestone' : 
                    index % 4 === 0 ? 'research' : 
                    index % 3 === 0 ? 'design' : 
                    index % 2 === 0 ? 'development' : 'testing',
            parentId: selectedRoadmapId,
            originalSubGoalId: subGoal.id
          }));
          
          setRoadmapItems(items);
        }
        
      } catch (error) {
        console.error('Error fetching sub-goals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sub-goals. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubGoals();
  }, [selectedRoadmapId, user]);
  
  const handleItemsChange = (updatedItems: SubGoalTimelineItem[]) => {
    setRoadmapItems(updatedItems);
    
    // Update progress on sub-goals in the database
    if (user && selectedRoadmapId) {
      updatedItems.forEach(async (item) => {
        if (item.originalSubGoalId) {
          try {
            await supabase
              .from('sub_goals')
              .update({ progress: item.progress })
              .eq('id', item.originalSubGoalId)
              .eq('user_id', user.id);
          } catch (error) {
            console.error('Error updating sub-goal progress:', error);
          }
        }
      });
    }
    
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
  
  const handleImportSubGoals = (parentId: string) => {
    // This function is for future use - importing goals from another parent
    toast({
      title: "Coming Soon",
      description: "Importing sub-goals will be available in the next update.",
    });
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
        <div className="container max-w-[1600px] pt-8 pb-24 relative z-10"> {/* Increased max-width and padding */}
          <div className="flex justify-between items-center mb-8"> {/* Increased margin */}
            <div>
              <h1 className="text-4xl font-bold text-gradient">Project Roadmap</h1> {/* Larger heading */}
              <p className="text-slate-400 mt-2 text-lg">Visualize your project timeline and milestones</p> {/* Larger text */}
            </div>
            
            <div className="flex gap-3"> {/* Increased gap */}
              <Button 
                variant="secondary"
                onClick={() => handleCreateRoadmap()}
                className="text-base px-5 py-2.5" {/* Larger button */}
              >
                <Plus size={18} className="mr-2" /> {/* Larger icon */}
                New Roadmap
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 mb-8"> {/* Enhanced container and increased spacing */}
            <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center"> {/* Increased gap */}
              <RoadmapSelector 
                selectedRoadmapId={selectedRoadmapId} 
                onSelectRoadmap={setSelectedRoadmapId}
                parentGoals={parentGoals}
              />
              
              <div className="flex bg-slate-800/50 rounded-md p-1.5"> {/* Increased padding */}
                <button 
                  onClick={() => handleViewChange("day")}
                  className={`px-4 py-1.5 text-sm rounded ${selectedView === "day" ? "bg-slate-700" : "hover:bg-slate-800/80"}`} {/* Increased size */}
                >
                  Day
                </button>
                <button 
                  onClick={() => handleViewChange("week")}
                  className={`px-4 py-1.5 text-sm rounded ${selectedView === "week" ? "bg-slate-700" : "hover:bg-slate-800/80"}`} {/* Increased size */}
                >
                  Week
                </button>
                <button 
                  onClick={() => handleViewChange("month")}
                  className={`px-4 py-1.5 text-sm rounded ${selectedView === "month" ? "bg-slate-700" : "hover:bg-slate-800/80"}`} {/* Increased size */}
                >
                  Month
                </button>
                <button 
                  onClick={() => handleViewChange("year")}
                  className={`px-4 py-1.5 text-sm rounded ${selectedView === "year" ? "bg-slate-700" : "hover:bg-slate-800/80"}`} {/* Increased size */}
                >
                  Year
                </button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-10 text-center shadow-xl"> {/* Enhanced container */}
              <p className="text-slate-400 text-lg">Loading roadmap data...</p> {/* Larger text */}
            </div>
          ) : !selectedRoadmapId ? (
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-10 text-center shadow-xl"> {/* Enhanced container */}
              <p className="text-slate-400 text-lg">Select a parent goal to view its roadmap</p> {/* Larger text */}
            </div>
          ) : (
            <RoadmapTimeline
              roadmapId={selectedRoadmapId}
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
