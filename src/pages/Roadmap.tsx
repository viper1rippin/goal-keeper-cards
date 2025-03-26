import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import AnimatedContainer from "@/components/AnimatedContainer";
import InfiniteTimeline from "@/components/roadmap/InfiniteTimeline";
import RoadmapSelector from "@/components/roadmap/RoadmapSelector";
import { SubGoalTimelineItem, TimelineViewMode, TimelineViewport, TimelineCategory } from "@/components/roadmap/types";
import StarsBackground from "@/components/effects/StarsBackground";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ParentGoal } from "@/components/index/IndexPageTypes";
import { ScrollArea } from "@/components/ui/scroll-area";

const Roadmap = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<TimelineViewMode>("month");
  const [roadmapItems, setRoadmapItems] = useState<SubGoalTimelineItem[]>([]);
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentViewport, setCurrentViewport] = useState<TimelineViewport | null>(null);
  
  useEffect(() => {
    const fetchParentGoals = async () => {
      if (!user) {
        setParentGoals([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
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
  
  useEffect(() => {
    const fetchSubGoals = async () => {
      if (!user || !selectedRoadmapId) {
        setRoadmapItems([]);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data: subGoalsData, error: subGoalsError } = await supabase
          .from('sub_goals')
          .select('*')
          .eq('parent_goal_id', selectedRoadmapId)
          .eq('user_id', user.id)
          .order('display_order', { ascending: true });
        
        if (subGoalsError) throw subGoalsError;
        
        if (subGoalsData) {
          const today = new Date();
          const items: SubGoalTimelineItem[] = subGoalsData.map((subGoal, index) => {
            const timelineRow = subGoal.timeline_row !== null ? subGoal.timeline_row : Math.floor(index / 3);
            const timelineStart = subGoal.timeline_start !== null ? subGoal.timeline_start : index * 2;
            const timelineDuration = subGoal.timeline_duration || 2;
            const timelineCategory = subGoal.timeline_category || 
              (index % 5 === 0 ? 'milestone' : 
               index % 4 === 0 ? 'research' : 
               index % 3 === 0 ? 'design' : 
               index % 2 === 0 ? 'development' : 'testing');
            
            const startDate = subGoal.start_date ? new Date(subGoal.start_date) : 
              new Date(today.getFullYear(), today.getMonth(), today.getDate() + index * 3);
            
            const endDate = subGoal.end_date ? new Date(subGoal.end_date) : 
              new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + timelineDuration);
            
            return {
              id: subGoal.id,
              title: subGoal.title,
              description: subGoal.description,
              row: timelineRow,
              start: timelineStart,
              duration: timelineDuration,
              progress: subGoal.progress || 0,
              category: timelineCategory as TimelineCategory,
              parentId: selectedRoadmapId,
              originalSubGoalId: subGoal.id,
              date: startDate,
              endDate: endDate
            };
          });
          
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
  
  const handleItemsChange = async (updatedItems: SubGoalTimelineItem[]) => {
    setRoadmapItems(updatedItems);
    
    if (user && selectedRoadmapId) {
      try {
        const updatePromises = updatedItems.map(async (item) => {
          if (item.originalSubGoalId) {
            return supabase
              .from('sub_goals')
              .update({
                progress: item.progress,
                timeline_row: item.row,
                timeline_start: item.start,
                timeline_duration: item.duration,
                timeline_category: item.category,
                start_date: item.date ? item.date.toISOString() : null,
                end_date: item.endDate ? item.endDate.toISOString() : null
              })
              .eq('id', item.originalSubGoalId)
              .eq('user_id', user.id);
          }
          return null;
        });
        
        await Promise.all(updatePromises.filter(p => p !== null));
      } catch (error) {
        console.error('Error updating sub-goal timeline data:', error);
        toast({
          title: 'Error',
          description: 'Failed to save timeline changes.',
          variant: 'destructive',
        });
      }
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
  
  const handleViewportChange = (viewport: TimelineViewport) => {
    setCurrentViewport(viewport);
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
        <div className="pt-8 pb-16 relative z-10 h-full flex flex-col">
          <div className="px-6">
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
          </div>
          
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-lg p-4 mx-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <RoadmapSelector 
                  selectedRoadmapId={selectedRoadmapId} 
                  onSelectRoadmap={setSelectedRoadmapId}
                  parentGoals={parentGoals}
                />
              </div>
              
              <div className="flex bg-slate-800/50 rounded-md p-1">
                <button 
                  onClick={() => handleViewChange("month")}
                  className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                    selectedView === "month" ? "bg-slate-700" : "hover:bg-slate-800/80"
                  }`}
                >
                  <Calendar size={14} />
                  Month
                </button>
                <button 
                  onClick={() => handleViewChange("year")}
                  className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                    selectedView === "year" ? "bg-slate-700" : "hover:bg-slate-800/80"
                  }`}
                >
                  <Calendar size={14} />
                  Year
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-6 flex-1 flex flex-col">
            {isLoading ? (
              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400">Loading roadmap data...</p>
              </div>
            ) : !selectedRoadmapId ? (
              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400">Select a parent goal to view its roadmap</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0">
                <InfiniteTimeline
                  items={roadmapItems}
                  viewMode={selectedView}
                  onItemsChange={handleItemsChange}
                  onViewportChange={handleViewportChange}
                />
              </div>
            )}
          </div>
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default Roadmap;
