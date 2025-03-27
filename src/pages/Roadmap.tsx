
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
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const parseTimelineCategory = (category: string | null): TimelineCategory => {
    if (!category) return 'default';
    
    const validCategories: TimelineCategory[] = [
      'research', 'design', 'development', 'testing', 
      'marketing', 'feature', 'milestone', 'default',
      'mobile', 'web', 'infrastructure', 'backend'
    ];
    
    return validCategories.includes(category as TimelineCategory) 
      ? (category as TimelineCategory) 
      : 'default';
  };
  
  useEffect(() => {
    const fetchParentGoals = async () => {
      if (!user) {
        setParentGoals([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setLoadingError(null);
        
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
        setLoadingError('Failed to load parent goals');
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
        setLoadingError(null);
        
        console.log(`Fetching sub-goals for parent ID: ${selectedRoadmapId}`);
        
        const { data: subGoalsData, error: subGoalsError } = await supabase
          .from('sub_goals')
          .select('*')
          .eq('parent_goal_id', selectedRoadmapId)
          .eq('user_id', user.id);
        
        if (subGoalsError) throw subGoalsError;
        
        if (subGoalsData) {
          console.log(`Found ${subGoalsData.length} sub-goals for parent ID: ${selectedRoadmapId}`, subGoalsData);
          
          // Generate timeline items with proper positioning
          const items: SubGoalTimelineItem[] = subGoalsData.map((subGoal, index) => {
            // Use existing timeline data if available, otherwise create default values
            const row = typeof subGoal.timeline_row === 'number' ? subGoal.timeline_row : Math.floor(index / 3);
            const start = typeof subGoal.timeline_start === 'number' ? subGoal.timeline_start : index;
            const duration = typeof subGoal.timeline_duration === 'number' ? subGoal.timeline_duration : 2;
            const category = parseTimelineCategory(subGoal.timeline_category);
            
            return {
              id: subGoal.id,
              title: subGoal.title,
              description: subGoal.description,
              row: row,
              start: start,
              duration: duration,
              progress: subGoal.progress || 0,
              category: category,
              parentId: selectedRoadmapId,
              originalSubGoalId: subGoal.id,
              startDate: subGoal.start_date || undefined,
              endDate: subGoal.end_date || undefined
            };
          });
          
          setRoadmapItems(items);
        } else {
          setRoadmapItems([]);
        }
        
      } catch (error) {
        console.error('Error fetching sub-goals:', error);
        setLoadingError('Failed to load sub-goals');
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
        console.log('Updating sub-goals in the database:', updatedItems);
        
        for (const item of updatedItems) {
          try {
            if (item.originalSubGoalId) {
              // Update existing sub-goal
              await supabase
                .from('sub_goals')
                .update({
                  progress: item.progress,
                  title: item.title,
                  description: item.description,
                  timeline_row: item.row,
                  timeline_start: item.start,
                  timeline_duration: item.duration,
                  timeline_category: item.category,
                  start_date: item.startDate,
                  end_date: item.endDate
                })
                .eq('id', item.originalSubGoalId)
                .eq('user_id', user.id);
            } else {
              // Create new sub-goal
              const { data, error } = await supabase
                .from('sub_goals')
                .insert({
                  parent_goal_id: selectedRoadmapId,
                  title: item.title,
                  description: item.description,
                  progress: item.progress,
                  user_id: user.id,
                  timeline_row: item.row,
                  timeline_start: item.start, 
                  timeline_duration: item.duration,
                  timeline_category: item.category,
                  start_date: item.startDate,
                  end_date: item.endDate
                })
                .select();
                
              if (!error && data && data.length > 0) {
                const newItemIndex = updatedItems.findIndex(i => i.id === item.id);
                if (newItemIndex >= 0) {
                  updatedItems[newItemIndex].originalSubGoalId = data[0].id;
                  setRoadmapItems([...updatedItems]);
                }
              }
            }
          } catch (error) {
            console.error('Error updating sub-goal:', error);
          }
        }
        
        // Handle deleted items
        const originalIds = roadmapItems
          .map(item => item.originalSubGoalId)
          .filter(Boolean) as string[];
          
        const updatedIds = updatedItems
          .map(item => item.originalSubGoalId)
          .filter(Boolean) as string[];
        
        const deletedIds = originalIds.filter(id => !updatedIds.includes(id));
        
        for (const id of deletedIds) {
          try {
            await supabase
              .from('sub_goals')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id);
          } catch (error) {
            console.error('Error deleting sub-goal:', error);
          }
        }
        
        toast({
          title: "Roadmap updated",
          description: "Your changes have been saved.",
        });
      } catch (error) {
        console.error('Error saving roadmap changes:', error);
        toast({
          title: "Error",
          description: "There was a problem saving your changes.",
          variant: "destructive"
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
  
  const handleViewChange = (view: "month" | "year") => {
    setSelectedView(view);
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
                parentGoals={parentGoals}
              />
              
              <div className="flex bg-slate-800/50 rounded-md p-1">
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
            <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-lg p-8 text-center">
              <p className="text-slate-400">Loading roadmap data...</p>
            </div>
          ) : loadingError ? (
            <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-lg p-8 text-center">
              <p className="text-red-400">{loadingError}</p>
              <button 
                className="mt-4 px-4 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
                onClick={() => setSelectedRoadmapId(selectedRoadmapId)}
              >
                Retry
              </button>
            </div>
          ) : !selectedRoadmapId ? (
            <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-lg p-8 text-center">
              <p className="text-slate-400">Select a parent goal to view its roadmap</p>
            </div>
          ) : roadmapItems.length === 0 ? (
            <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-lg p-8 text-center">
              <p className="text-slate-400">No sub-goals found for this roadmap</p>
              <p className="text-slate-500 mt-2">Add sub-goals from the home page or create them directly in the roadmap</p>
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
