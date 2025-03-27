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
  const [lastSaveTimestamp, setLastSaveTimestamp] = useState(Date.now());
  const [isDirty, setIsDirty] = useState(false);
  
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
        
        const { data: allSubGoals, error: subGoalsError } = await supabase
          .from('sub_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('display_order', { ascending: true });
          
        if (subGoalsError) throw subGoalsError;
        
        const groupedSubGoals: Record<string, Goal[]> = {};
        
        if (parentGoalsData) {
          parentGoalsData.forEach(parent => {
            groupedSubGoals[parent.id] = [];
          });
        }
        
        if (allSubGoals) {
          allSubGoals.forEach((subGoal: any) => {
            if (groupedSubGoals[subGoal.parent_goal_id]) {
              groupedSubGoals[subGoal.parent_goal_id].push({
                id: subGoal.id,
                title: subGoal.title,
                description: subGoal.description,
                progress: subGoal.progress || 0,
                startDate: subGoal.start_date,
                endDate: subGoal.end_date,
                timeline_row: subGoal.timeline_row,
                timeline_start: subGoal.timeline_start,
                timeline_duration: subGoal.timeline_duration
              });
            }
          });
        }
        
        if (parentGoalsData) {
          const formattedParentGoals: ParentGoal[] = parentGoalsData.map(pg => ({
            id: pg.id,
            title: pg.title,
            description: pg.description,
            goals: groupedSubGoals[pg.id] || [],
            position: pg.position || 0,
            user_id: pg.user_id
          }));
          
          setParentGoals(formattedParentGoals);
          
          if (!selectedRoadmapId && formattedParentGoals.length > 0) {
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
        setIsDirty(false);
      }
    };
    
    fetchParentGoals();
  }, [user, lastSaveTimestamp]);
  
  useEffect(() => {
    const loadSubGoalsToTimeline = () => {
      if (!selectedRoadmapId || !parentGoals.length) return;
      
      const selectedParent = parentGoals.find(pg => pg.id === selectedRoadmapId);
      if (!selectedParent) return;
      
      const items: SubGoalTimelineItem[] = selectedParent.goals.map((subGoal, index) => {
        const row = subGoal.timeline_row !== undefined ? subGoal.timeline_row : Math.floor(index / 3);
        const start = subGoal.timeline_start !== undefined ? subGoal.timeline_start : index * 3;
        const duration = subGoal.timeline_duration !== undefined ? subGoal.timeline_duration : 2;
        
        return {
          id: subGoal.id || '',
          title: subGoal.title,
          description: subGoal.description,
          row: row,
          start: start,
          duration: duration,
          progress: subGoal.progress || 0,
          parentId: selectedRoadmapId,
          originalSubGoalId: subGoal.id,
          startDate: subGoal.startDate || undefined,
          endDate: subGoal.endDate || undefined
        };
      });
      
      setRoadmapItems(items);
    };
    
    loadSubGoalsToTimeline();
  }, [selectedRoadmapId, parentGoals]);
  
  const handleItemsChange = async (updatedItems: SubGoalTimelineItem[]) => {
    // Update the local state immediately for visual feedback
    setRoadmapItems(updatedItems);
    setIsDirty(true);
    
    // Only proceed with DB updates if user is authenticated and roadmap is selected
    if (user && selectedRoadmapId) {
      // Track whether any database operations were successful
      let databaseUpdated = false;
      let updateErrors = 0;
      
      for (const item of updatedItems) {
        try {
          // For existing items
          if (item.originalSubGoalId) {
            console.log('Updating sub-goal:', {
              id: item.originalSubGoalId,
              row: item.row,
              start: item.start,
              duration: item.duration,
              startDate: item.startDate,
              endDate: item.endDate
            });
            
            const { error } = await supabase
              .from('sub_goals')
              .update({
                progress: item.progress,
                title: item.title,
                description: item.description,
                timeline_row: item.row,
                timeline_start: item.start,
                timeline_duration: item.duration,
                start_date: item.startDate,
                end_date: item.endDate
              })
              .eq('id', item.originalSubGoalId)
              .eq('user_id', user.id);
              
            if (error) {
              console.error('Error updating sub-goal:', error);
              updateErrors++;
            } else {
              databaseUpdated = true;
            }
          } 
          // For new items
          else {
            console.log('Creating new sub-goal:', {
              title: item.title,
              row: item.row,
              start: item.start,
              duration: item.duration,
              startDate: item.startDate,
              endDate: item.endDate
            });
            
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
                start_date: item.startDate,
                end_date: item.endDate
              })
              .select();
              
            if (error) {
              console.error('Error creating sub-goal:', error);
              updateErrors++;
            } else if (data && data.length > 0) {
              const newItemIndex = updatedItems.findIndex(i => i.id === item.id);
              if (newItemIndex >= 0) {
                // Update the local item with the new ID from database
                const newItems = [...updatedItems];
                newItems[newItemIndex].originalSubGoalId = data[0].id;
                setRoadmapItems(newItems);
                databaseUpdated = true;
              }
            }
          }
        } catch (error) {
          console.error('Error updating sub-goal:', error);
          updateErrors++;
        }
      }
      
      // Check for items that were deleted
      const originalIds = roadmapItems.map(item => item.originalSubGoalId).filter(Boolean);
      const updatedIds = updatedItems.map(item => item.originalSubGoalId).filter(Boolean);
      const deletedIds = originalIds.filter(id => !updatedIds.includes(id));
      
      // Process deletions
      for (const id of deletedIds) {
        try {
          console.log('Deleting sub-goal:', id);
          
          const { error } = await supabase
            .from('sub_goals')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
            
          if (error) {
            console.error('Error deleting sub-goal:', error);
            updateErrors++;
          } else {
            databaseUpdated = true;
          }
        } catch (error) {
          console.error('Error deleting sub-goal:', error);
          updateErrors++;
        }
      }
      
      // If any database operation was successful, update the timestamp to trigger a data refresh
      if (databaseUpdated) {
        setLastSaveTimestamp(Date.now());
        setIsDirty(false);
        
        if (updateErrors > 0) {
          toast({
            title: "Partially updated",
            description: `Roadmap updated with ${updateErrors} errors.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Roadmap updated",
            description: "Your changes have been saved successfully.",
          });
        }
      } else if (updateErrors > 0) {
        toast({
          title: "Update failed",
          description: "Failed to save changes. Please try again.",
          variant: "destructive",
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
  
  const handleImportSubGoals = (parentId: string) => {
    toast({
      title: "Coming Soon",
      description: "Importing sub-goals will be available in the next update.",
    });
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
          ) : !selectedRoadmapId ? (
            <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-lg p-8 text-center">
              <p className="text-slate-400">Select a parent goal to view its roadmap</p>
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
