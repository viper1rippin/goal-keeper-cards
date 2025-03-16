import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import GoalRow, { Goal } from "@/components/GoalRow";
import AnimatedContainer from "@/components/AnimatedContainer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ParentGoalDialog from "@/components/ParentGoalDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';

interface ParentGoal {
  id: string;
  title: string;
  description: string;
  goals: Goal[];
  position?: number;
}

const Index = () => {
  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // State for active focus goal
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [activeGoalIndices, setActiveGoalIndices] = useState<{rowIndex: number, goalIndex: number} | null>(null);
  
  // State for focus timer visibility
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  
  // State for parent goals
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for parent goal dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<ParentGoal | null>(null);
  
  const { toast } = useToast();
  
  // Fetch parent goals from Supabase
  const fetchParentGoals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('parent_goals')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include empty goals array if no data
      const transformedData = data?.map(goal => ({
        ...goal,
        goals: goal.id === goalToEdit?.id && goalToEdit?.goals 
          ? goalToEdit.goals
          : []
      })) || [];
      
      setParentGoals(transformedData);
    } catch (error) {
      console.error("Error fetching parent goals:", error);
      toast({
        title: "Error",
        description: "Failed to load your goals. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save the updated order of parent goals to the database
  const saveParentGoalOrder = async (updatedGoals: ParentGoal[]) => {
    try {
      // Update each goal with its new position
      for (let i = 0; i < updatedGoals.length; i++) {
        const { error } = await supabase
          .from('parent_goals')
          .update({ 
            position: i 
          } as any)
          .eq('id', updatedGoals[i].id);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving goal order:", error);
      toast({
        title: "Error",
        description: "Failed to save goal order. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle creating or editing goal
  const handleCreateOrEditGoal = (goal: ParentGoal | null = null) => {
    setGoalToEdit(goal);
    setIsDialogOpen(true);
  };
  
  // Handle goal focus
  const handleGoalFocus = (goal: Goal, rowIndex: number, goalIndex: number) => {
    setActiveGoal(goal);
    setActiveGoalIndices({ rowIndex, goalIndex });
    setShowFocusTimer(true);
  };
  
  // Handle stopping focus
  const handleStopFocus = () => {
    setActiveGoal(null);
    setActiveGoalIndices(null);
  };
  
  // Handle updating sub-goals for a parent goal
  const handleUpdateSubGoals = (parentIndex: number, updatedGoals: Goal[]) => {
    const updatedParentGoals = [...parentGoals];
    updatedParentGoals[parentIndex] = {
      ...updatedParentGoals[parentIndex],
      goals: updatedGoals
    };
    setParentGoals(updatedParentGoals);
    
    // Show success toast
    toast({
      title: "Success",
      description: "Sub-goal updated successfully",
    });
  };
  
  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      setParentGoals((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        // Update parent goal indices in activeGoalIndices if needed
        if (activeGoalIndices) {
          const { rowIndex, goalIndex } = activeGoalIndices;
          if (rowIndex === oldIndex) {
            setActiveGoalIndices({
              rowIndex: newIndex,
              goalIndex
            });
          } else if (rowIndex > oldIndex && rowIndex <= newIndex) {
            setActiveGoalIndices({
              rowIndex: rowIndex - 1,
              goalIndex
            });
          } else if (rowIndex < oldIndex && rowIndex >= newIndex) {
            setActiveGoalIndices({
              rowIndex: rowIndex + 1,
              goalIndex
            });
          }
        }
        
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        
        // Save the new order to the database
        saveParentGoalOrder(reorderedItems);
        
        return reorderedItems;
      });
      
      toast({
        title: "Success",
        description: "Goal order updated",
      });
    }
  };
  
  // Fetch goals on component mount
  useEffect(() => {
    fetchParentGoals();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-apple-dark">
      <Header 
        activeGoal={activeGoal}
        showFocusTimer={showFocusTimer}
        setShowFocusTimer={setShowFocusTimer}
        onStopFocus={handleStopFocus}
      />
      
      <main className="flex-1 py-10 px-6 sm:px-8 md:px-12 lg:px-16">
        <AnimatedContainer className="max-w-7xl mx-auto mb-12">
          <div className="glass-card p-6 rounded-lg border border-slate-800/80 mb-12">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium mb-1">Welcome back, John</h2>
                <p className="text-slate-400">Track your progress and stay focused on your goals.</p>
              </div>
              <Button 
                onClick={() => handleCreateOrEditGoal()}
                className="bg-emerald hover:bg-emerald-dark"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-20 text-center text-slate-400">
              <p>Loading your goals...</p>
            </div>
          ) : parentGoals.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="text-xl font-medium mb-2">No goals yet</h3>
              <p className="text-slate-400 mb-6">Create your first goal to get started</p>
              <Button 
                onClick={() => handleCreateOrEditGoal()} 
                className="bg-emerald hover:bg-emerald-dark"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Goal
              </Button>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={parentGoals.map(goal => goal.id)}
                strategy={verticalListSortingStrategy}
              >
                {parentGoals.map((parentGoal, rowIndex) => (
                  <div key={parentGoal.id} className="relative">
                    <GoalRow
                      id={parentGoal.id}
                      title={parentGoal.title}
                      description={parentGoal.description}
                      goals={parentGoal.goals}
                      index={rowIndex}
                      activeGoal={activeGoalIndices}
                      onGoalFocus={handleGoalFocus}
                      onUpdateSubGoals={handleUpdateSubGoals}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-0 right-0 text-slate-400 hover:text-white hover:bg-slate-800/30"
                      onClick={() => handleCreateOrEditGoal(parentGoal)}
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </AnimatedContainer>
      </main>
      
      <footer className="py-6 px-6 sm:px-8 md:px-12 lg:px-16 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          <p>John's App © {new Date().getFullYear()} · Progress Tracker</p>
        </div>
      </footer>
      
      <ParentGoalDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
        onGoalSaved={fetchParentGoals}
      />
    </div>
  );
};

export default Index;
