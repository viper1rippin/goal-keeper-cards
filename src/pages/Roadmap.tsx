
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import AnimatedContainer from "@/components/AnimatedContainer";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import RoadmapSelector from "@/components/roadmap/RoadmapSelector";
import { RoadmapData, SubGoalTimelineItem } from "@/components/roadmap/types";
import { ParentGoal } from "@/components/index/IndexPageTypes";
import { supabase } from "@/integrations/supabase/client";
import ParentGoalSelector from "@/components/roadmap/ParentGoalSelector";
import { Goal } from "@/components/GoalRow";
import { getSampleRoadmapData } from "@/components/roadmap/sampleRoadmapData";

// Helper function to create database schema checks
const checkTableExists = async (tableName: string) => {
  const { data, error } = await supabase.rpc('check_table_exists', { check_name: tableName });
  if (error) {
    console.error("Error checking if table exists:", error);
    return false;
  }
  return !!data;
};

// Raw database operation for tables not in the TypeScript types
const createRoadmapsTable = async () => {
  // This SQL is executed directly against the database
  const { error } = await supabase.rpc('check_table_exists', { check_name: 'roadmaps' });
  
  if (error) {
    console.error("Error checking table existence:", error);
  }
};

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
        // Check if the roadmaps table exists, if not, show a message
        const exists = await checkTableExists('roadmaps');
        if (!exists) {
          toast({
            title: "Database setup required",
            description: "Please run database migrations to enable roadmaps",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Fetch roadmaps using supabase.from method with type assertion
        const { data: roadmapsData, error: roadmapsError } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('user_id', user.id);
          
        if (roadmapsError) throw roadmapsError;
        
        // Fetch parent goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('parent_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('position', { ascending: true });
          
        if (goalsError) throw goalsError;
        
        // Process roadmaps with type assertion
        const processedRoadmaps: RoadmapData[] = (roadmapsData || []).map((road: any) => ({
          id: road.id,
          title: road.title,
          description: road.description,
          user_id: road.user_id,
          items: road.items || [],
          created_at: road.created_at,
          updated_at: road.updated_at
        }));
        
        if (processedRoadmaps.length > 0 && !selectedRoadmapId) {
          setSelectedRoadmapId(processedRoadmaps[0].id);
        }
        
        // Process parent goals
        const processedParentGoals = (goalsData || []).map((goal: any) => ({
          ...goal,
          goals: [] // Add the missing required property
        }));
        
        setRoadmaps(processedRoadmaps);
        setParentGoals(processedParentGoals);
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
  }, [user, selectedRoadmapId]);

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
      
      // Insert the new roadmap with type assertion
      const { data, error } = await supabase
        .from('roadmaps')
        .insert(newRoadmap)
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Create a properly typed roadmap object from the response
        const newRoadmapTyped: RoadmapData = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          user_id: data[0].user_id,
          items: data[0].items || [],
          created_at: data[0].created_at,
          updated_at: data[0].updated_at
        };
        
        setRoadmaps([newRoadmapTyped, ...roadmaps]);
        setSelectedRoadmapId(newRoadmapTyped.id);
        
        toast({
          title: "Success",
          description: "New roadmap created",
        });
      }
    } catch (error) {
      console.error("Error creating roadmap:", error);
      toast({
        title: "Error",
        description: "Failed to create new roadmap",
        variant: "destructive",
      });
    }
  };
  
  // Create a sample roadmap with example data
  const handleCreateSampleRoadmap = async () => {
    if (!user) return;
    
    try {
      const sampleData = getSampleRoadmapData();
      
      const newRoadmap = {
        title: "Product Roadmap 2024",
        description: "Annual product roadmap with all development tracks",
        user_id: user.id,
        items: sampleData
      };
      
      // Insert the new roadmap with type assertion
      const { data, error } = await supabase
        .from('roadmaps')
        .insert(newRoadmap)
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Create a properly typed roadmap object from the response
        const newRoadmapTyped: RoadmapData = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          user_id: data[0].user_id,
          items: data[0].items || [],
          created_at: data[0].created_at,
          updated_at: data[0].updated_at
        };
        
        setRoadmaps([newRoadmapTyped, ...roadmaps]);
        setSelectedRoadmapId(newRoadmapTyped.id);
        
        toast({
          title: "Success",
          description: "Sample roadmap created with example data",
        });
      }
    } catch (error) {
      console.error("Error creating sample roadmap:", error);
      toast({
        title: "Error",
        description: "Failed to create sample roadmap",
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
        .eq('parent_goal_id', parentGoalId)
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
        id: subGoal.id || `sg-${Date.now()}-${index}`,
        title: subGoal.title,
        description: subGoal.description,
        progress: subGoal.progress,
        row: index % 3, // Distribute across 3 rows
        start: 0, // Start at beginning of timeline
        duration: 2, // Default to 2 month duration
        category: 'feature',
        parentId: parentGoalId,
        originalSubGoalId: subGoal.id
      }));
      
      // Update the roadmap with new items
      const updatedRoadmap = {
        ...currentRoadmap,
        items: [...(currentRoadmap.items || []), ...newItems]
      };
      
      // Use type assertion for supabase call
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
        className={`flex-1 min-h-screen pb-16 bg-slate-100 dark:bg-slate-950 transition-all ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="container py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gradient">Project Roadmap</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCreateSampleRoadmap} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <Upload size={16} className="mr-2" />
                Create Example
              </Button>
              <Button onClick={handleCreateRoadmap} className="bg-emerald hover:bg-emerald-600">
                <Plus size={16} className="mr-2" />
                New Roadmap
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg text-slate-400">Loading roadmaps...</p>
            </div>
          ) : roadmaps.length === 0 ? (
            <div className="glass-card p-8 rounded-lg text-center bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-medium mb-4">No Roadmaps Yet</h3>
              <p className="mb-6 text-slate-600 dark:text-slate-400">Create your first roadmap to visualize your project timeline.</p>
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleCreateSampleRoadmap} 
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                >
                  <Upload size={16} className="mr-2" />
                  Create Example
                </Button>
                <Button onClick={handleCreateRoadmap} className="bg-emerald hover:bg-emerald-600">
                  <Plus size={16} className="mr-2" />
                  Create Roadmap
                </Button>
              </div>
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
                    
                    // Save to database with type assertion
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
