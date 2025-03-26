
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

const Roadmap = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<TimelineViewMode>("month");
  const [roadmapItems, setRoadmapItems] = useState<SubGoalTimelineItem[]>([]);
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
          const items: SubGoalTimelineItem[] = subGoalsData.map((subGoal, index) => ({
            id: subGoal.id,
            title: subGoal.title,
            description: subGoal.description,
            row: subGoal.timeline_row ?? Math.floor(index / 3),
            start: subGoal.timeline_start ?? index * 3,
            duration: subGoal.timeline_duration ?? 2,
            progress: subGoal.progress || 0,
            category: (subGoal.timeline_category as TimelineCategory) || 
                     (index % 5 === 0 ? 'milestone' : 
                     index % 4 === 0 ? 'research' : 
                     index % 3 === 0 ? 'design' : 
                     index % 2 === 0 ? 'development' : 'testing'),
            color: subGoal.color,
            parentId: selectedRoadmapId,
            originalSubGoalId: subGoal.id,
            startDate: subGoal.start_date,
            endDate: subGoal.end_date
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
  
  const handleItemsChange = async (updatedItems: SubGoalTimelineItem[]) => {
    setRoadmapItems(updatedItems);
    
    if (!user || !selectedRoadmapId) return;
    
    try {
      for (const item of updatedItems) {
        if (item.originalSubGoalId) {
          // Update existing sub-goal
          await supabase
            .from('sub_goals')
            .update({
              progress: item.progress,
              timeline_row: item.row,
              timeline_start: item.start,
              timeline_duration: item.duration,
              timeline_category: item.category,
              start_date: item.startDate,
              end_date: item.endDate,
              color: item.color
            })
            .eq('id', item.originalSubGoalId)
            .eq('user_id', user.id);
        } else {
          // This is a new item created directly in the timeline
          // Create a new sub-goal in the database and link it to the parent goal
          const { data: newSubGoal, error } = await supabase
            .from('sub_goals')
            .insert({
              title: item.title,
              description: item.description,
              progress: item.progress || 0,
              parent_goal_id: selectedRoadmapId,
              user_id: user.id,
              timeline_row: item.row,
              timeline_start: item.start,
              timeline_duration: item.duration,
              timeline_category: item.category || 'default',
              start_date: item.startDate,
              end_date: item.endDate,
              color: item.color
            })
            .select('*')
            .single();
          
          if (error) throw error;
          
          // Update the item with the new ID from the database
          if (newSubGoal) {
            const updatedItemsWithNewId = roadmapItems.map(mapItem => 
              mapItem.id === item.id ? { ...mapItem, id: newSubGoal.id, originalSubGoalId: newSubGoal.id } : mapItem
            );
            setRoadmapItems(updatedItemsWithNewId);
          }
        }
      }
      
      toast({
        title: "Roadmap updated",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error('Error updating roadmap items:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
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
  
  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;
    
    try {
      // Find the item to delete
      const itemToDelete = roadmapItems.find(item => item.id === itemId);
      
      if (itemToDelete?.originalSubGoalId) {
        // Delete from database
        await supabase
          .from('sub_goals')
          .delete()
          .eq('id', itemToDelete.originalSubGoalId)
          .eq('user_id', user.id);
      }
      
      // Update local state
      const updatedItems = roadmapItems.filter(item => item.id !== itemId);
      setRoadmapItems(updatedItems);
      
      toast({
        title: "Item deleted",
        description: "The item has been removed from the roadmap.",
      });
    } catch (error) {
      console.error('Error deleting roadmap item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    }
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
              onDeleteItem={handleDeleteItem}
              viewMode={selectedView}
            />
          )}
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default Roadmap;
