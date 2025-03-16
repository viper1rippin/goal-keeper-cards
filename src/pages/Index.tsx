import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import AnimatedContainer from "@/components/AnimatedContainer";
import { Goal } from "@/components/GoalRow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import WelcomeCard from "@/components/WelcomeCard";
import EmptyGoalsList from "@/components/EmptyGoalsList";
import GoalsList from "@/components/GoalsList";
import Footer from "@/components/Footer";
import LoadingGoals from "@/components/LoadingGoals";
import ParentGoalDialog from "@/components/ParentGoalDialog";

interface ParentGoal {
  id: string;
  title: string;
  description: string;
  goals: Goal[];
  position?: number;
}

const Index = () => {
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
  
  // Handle goal focus - this is the key function to ensure only one goal is active
  const handleGoalFocus = (goal: Goal, rowIndex: number, goalIndex: number) => {
    // If clicking on the already active goal, do nothing (maintain active state)
    if (activeGoalIndices?.rowIndex === rowIndex && activeGoalIndices?.goalIndex === goalIndex) {
      return;
    }
    
    // Otherwise, set the new active goal
    setActiveGoal(goal);
    setActiveGoalIndices({ rowIndex, goalIndex });
    setShowFocusTimer(true);
    
    // Show toast to indicate the focus change
    toast({
      title: `Now focusing on: ${goal.title}`,
      description: "Focus mode activated for this goal",
    });
  };
  
  // Handle stopping focus
  const handleStopFocus = () => {
    // Clear both the active goal and its indices
    setActiveGoal(null);
    setActiveGoalIndices(null);
    
    // Show toast to indicate focus has stopped
    toast({
      title: "Focus ended",
      description: "You've stopped focusing on all goals",
    });
  };
  
  // Handle updating sub-goals for a parent goal
  const handleUpdateSubGoals = (parentIndex: number, updatedGoals: Goal[]) => {
    const updatedParentGoals = [...parentGoals];
    updatedParentGoals[parentIndex] = {
      ...updatedParentGoals[parentIndex],
      goals: updatedGoals
    };
    setParentGoals(updatedParentGoals);
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
        <WelcomeCard onAddGoal={() => handleCreateOrEditGoal()} />
        
        {isLoading ? (
          <LoadingGoals />
        ) : parentGoals.length === 0 ? (
          <EmptyGoalsList onCreateGoal={() => handleCreateOrEditGoal()} />
        ) : (
          <GoalsList 
            parentGoals={parentGoals}
            activeGoalIndices={activeGoalIndices}
            onGoalFocus={handleGoalFocus}
            onUpdateSubGoals={handleUpdateSubGoals}
            onEditGoal={handleCreateOrEditGoal}
            onDragEnd={handleDragEnd}
          />
        )}
      </main>
      
      <Footer />
      
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
