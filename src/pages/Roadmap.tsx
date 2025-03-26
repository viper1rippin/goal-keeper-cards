
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import AnimatedContainer from "@/components/AnimatedContainer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import RoadmapSelector from "@/components/roadmap/RoadmapSelector";
import { RoadmapData, SubGoalTimelineItem } from "@/components/roadmap/types";
import { ParentGoal } from "@/components/index/IndexPageTypes";
import { supabase } from "@/integrations/supabase/client";
import ParentGoalSelector from "@/components/roadmap/ParentGoalSelector";
import { Goal } from "@/components/GoalRow";

const Roadmap = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's roadmaps and parent goals
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch roadmaps
        const { data: roadmapsData, error: roadmapsError } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (roadmapsError) throw roadmapsError;
        
        // Fetch parent goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('parent_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('position', { ascending: true });
          
        if (goalsError) throw goalsError;
        
        // Process the data
        const processedRoadmaps = roadmapsData || [];
        if (processedRoadmaps.length > 0 && !selectedRoadmapId) {
          setSelectedRoadmapId(processedRoadmaps[0].id);
        }
        
        setRoadmaps(processedRoadmaps);
        setParentGoals(goalsData || []);
      } catch (error) {
        console.error("Error fetching roadmap data:", error);
        toast({
          title: "Error",
          description: "Failed to load roadmap data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Create a new roadmap
  const handleCreateRoadmap = async () => {
    if (!user) return;
    
    try {
      const newRoadmap = {
        title: "New Roadmap",
        description: "My project roadmap",
        user_id: user.id,
        items: []
      };
      
      const { data, error } = await supabase
        .from('roadmaps')
        .insert(newRoadmap)
        .select()
        .single();
        
      if (error) throw error;
      
      setRoadmaps([data, ...roadmaps]);
      setSelectedRoadmapId(data.id);
      
      toast({
        title: "Success",
        description: "New roadmap created",
      });
    } catch (error) {
      console.error("Error creating roadmap:", error);
      toast({
        title: "Error",
        description: "Failed to create new roadmap",
        variant: "destructive",
      });
    }
  };

  // Import sub-goals from a parent goal
  const handleImportFromParentGoal = async (parentGoalId: string) => {
    if (!user || !selectedRoadmapId) return;
    
    try {
      // Find the parent goal
      const parentGoal = parentGoals.find(goal => goal.id === parentGoalId);
      if (!parentGoal) return;
      
      // Get the current roadmap
      const currentRoadmap = roadmaps.find(roadmap => roadmap.id === selectedRoadmapId);
      if (!currentRoadmap) return;
      
      // Fetch sub-goals for this parent
      const { data: subGoals, error } = await supabase
        .from('sub_goals')
        .select('*')
        .eq('parent_id', parentGoalId)
        .order('position', { ascending: true });
        
      if (error) throw error;
      
      if (!subGoals || subGoals.length === 0) {
        toast({
          title: "No sub-goals found",
          description: "This parent goal doesn't have any sub-goals to import",
        });
        return;
      }
      
      // Convert sub-goals to timeline items
      const newItems: SubGoalTimelineItem[] = subGoals.map((subGoal: Goal, index: number) => ({
        id: subGoal.id,
        title: subGoal.title,
        description: subGoal.description,
        progress: subGoal.progress,
        row: index % 3, // Distribute across 3 rows
        start: 0, // Start at beginning of timeline
        duration: 2, // Default to 2 month duration
        parentId: parentGoalId,
        originalSubGoalId: subGoal.id
      }));
      
      // Update the roadmap with new items
      const updatedRoadmap = {
        ...currentRoadmap,
        items: [...(currentRoadmap.items || []), ...newItems]
      };
      
      const { error: updateError } = await supabase
        .from('roadmaps')
        .update({ items: updatedRoadmap.items })
        .eq('id', selectedRoadmapId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setRoadmaps(roadmaps.map(roadmap => 
        roadmap.id === selectedRoadmapId ? updatedRoadmap : roadmap
      ));
      
      toast({
        title: "Success",
        description: `Imported ${newItems.length} sub-goals from "${parentGoal.title}"`,
      });
    } catch (error) {
      console.error("Error importing from parent goal:", error);
      toast({
        title: "Error",
        description: "Failed to import sub-goals",
        variant: "destructive",
      });
    }
  };

  // Get the currently selected roadmap
  const selectedRoadmap = roadmaps.find(roadmap => roadmap.id === selectedRoadmapId);

  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <AnimatedContainer 
        animation="fade-in" 
        className={`flex-1 min-h-screen pb-16 bg-slate-950 transition-all ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="container py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gradient">Project Roadmap</h1>
            <Button onClick={handleCreateRoadmap} className="bg-emerald hover:bg-emerald-dark">
              <Plus size={16} className="mr-2" />
              New Roadmap
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg text-slate-400">Loading roadmaps...</p>
            </div>
          ) : roadmaps.length === 0 ? (
            <div className="glass-card p-8 rounded-lg text-center">
              <h3 className="text-xl font-medium mb-4">No Roadmaps Yet</h3>
              <p className="mb-6 text-slate-400">Create your first roadmap to visualize your project timeline.</p>
              <Button onClick={handleCreateRoadmap} className="bg-emerald hover:bg-emerald-dark">
                <Plus size={16} className="mr-2" />
                Create Roadmap
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-3">
                  <RoadmapSelector 
                    roadmaps={roadmaps} 
                    selectedId={selectedRoadmapId} 
                    onSelect={setSelectedRoadmapId} 
                  />
                </div>
                <div className="md:col-span-1">
                  <ParentGoalSelector 
                    parentGoals={parentGoals} 
                    onSelect={handleImportFromParentGoal} 
                  />
                </div>
              </div>
              
              {selectedRoadmap && (
                <RoadmapTimeline 
                  roadmapId={selectedRoadmap.id}
                  items={selectedRoadmap.items || []} 
                  onItemsChange={(updatedItems) => {
                    // Update local state
                    const updatedRoadmaps = roadmaps.map(roadmap => 
                      roadmap.id === selectedRoadmapId 
                        ? {...roadmap, items: updatedItems} 
                        : roadmap
                    );
                    setRoadmaps(updatedRoadmaps);
                    
                    // Save to database
                    if (user) {
                      supabase
                        .from('roadmaps')
                        .update({ items: updatedItems })
                        .eq('id', selectedRoadmapId)
                        .then(({ error }) => {
                          if (error) {
                            console.error("Error saving roadmap:", error);
                            toast({
                              title: "Error",
                              description: "Failed to save changes",
                              variant: "destructive",
                            });
                          }
                        });
                    }
                  }}
                />
              )}
            </>
          )}
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default Roadmap;
