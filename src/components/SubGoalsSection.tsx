
import React, { useState } from 'react';
import { Goal } from './GoalRow';
import SortableSubGoalCard from './SortableSubGoalCard';
import SubGoalAddCard from './SubGoalAddCard';
import SubGoalDialog from './SubGoalDialog';
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import GoalCard from './GoalCard';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubGoalsSectionProps {
  subGoals: Goal[];
  parentTitle: string;
  parentId: string;
  rowIndex: number;
  activeGoal?: {rowIndex: number, goalIndex: number} | null;
  onGoalFocus: (goal: Goal, rowIndex: number, goalIndex: number) => void;
  onUpdateSubGoals: (updatedGoals: Goal[]) => void;
  isLoading: boolean;
}

const SubGoalsSection: React.FC<SubGoalsSectionProps> = ({
  subGoals,
  parentTitle,
  parentId,
  rowIndex,
  activeGoal,
  onGoalFocus,
  onUpdateSubGoals,
  isLoading
}) => {
  const { toast } = useToast();
  
  // State for drag and drop of sub-goals
  const [activeSubGoal, setActiveSubGoal] = useState<Goal | null>(null);
  const [activeSubGoalId, setActiveSubGoalId] = useState<string | null>(null);
  
  // State for sub-goal dialog
  const [isSubGoalDialogOpen, setIsSubGoalDialogOpen] = useState(false);
  const [subGoalToEdit, setSubGoalToEdit] = useState<Goal | null>(null);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  
  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    })
  );

  // Handle adding a new sub-goal
  const handleAddSubGoal = () => {
    setSubGoalToEdit(null);
    setEditingGoalIndex(null);
    setIsSubGoalDialogOpen(true);
  };
  
  // Handle editing an existing sub-goal
  const handleEditSubGoal = (goal: Goal, index: number) => {
    setSubGoalToEdit(goal);
    setEditingGoalIndex(index);
    setIsSubGoalDialogOpen(true);
  };
  
  // Handle saving sub-goal (both add and edit)
  const handleSaveSubGoal = (subGoal: Omit<Goal, 'progress'>) => {
    // Close the dialog
    setIsSubGoalDialogOpen(false);
    // We'll refresh subgoals by calling fetchSubGoals from the parent
    onUpdateSubGoals(subGoals);
  };
  
  // Handle drag start for sub-goals
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveSubGoalId(active.id as string);
    const draggedGoal = subGoals.find(goal => goal.id === active.id);
    if (draggedGoal) {
      setActiveSubGoal(draggedGoal);
    }
  };

  // Handle drag end for sub-goals
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      const reorderedGoals = [...subGoals];
      const oldIndex = reorderedGoals.findIndex(item => item.id === active.id);
      const newIndex = reorderedGoals.findIndex(item => item.id === over.id);
      
      // Reorder the items
      const newItems = arrayMove(reorderedGoals, oldIndex, newIndex);
      
      // Save the new order to the database
      saveSubGoalOrder(newItems);
      
      // Update the parent component
      onUpdateSubGoals(newItems);
    }
    
    // Clear the active sub-goal when dragging ends
    setActiveSubGoal(null);
    setActiveSubGoalId(null);
  };
  
  // Save the updated order of sub-goals to the database
  const saveSubGoalOrder = async (updatedSubGoals: Goal[]) => {
    try {
      // Since there's no position field in the database,
      // we'll need to update the goals one by one with a timestamp to maintain order
      // We'll use the updated_at field to maintain order
      for (let i = 0; i < updatedSubGoals.length; i++) {
        if (updatedSubGoals[i].id) {
          // Add a small delay between updates to ensure ordering by updated_at works correctly
          const delayOffset = i * 50; // 50ms spacing between updates
          
          setTimeout(async () => {
            const { error } = await supabase
              .from('sub_goals')
              .update({ 
                updated_at: new Date().toISOString()
              })
              .eq('id', updatedSubGoals[i].id);
            
            if (error) throw error;
          }, delayOffset);
        }
      }
    } catch (error) {
      console.error("Error saving sub-goal order:", error);
      toast({
        title: "Error",
        description: "Failed to save sub-goal order. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="col-span-4 py-8 text-center text-slate-400">
        Loading sub-goals...
      </div>
    );
  }

  return (
    <>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={subGoals.map(goal => goal.id || '')}
          strategy={horizontalListSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subGoals.map((goal, goalIndex) => {
              const isActiveGoal = activeGoal?.rowIndex === rowIndex && activeGoal?.goalIndex === goalIndex;
              
              return (
                <SortableSubGoalCard 
                  key={goal.id || goalIndex}
                  goal={goal}
                  index={goalIndex}
                  isActiveGoal={isActiveGoal}
                  onGoalFocus={() => onGoalFocus(goal, rowIndex, goalIndex)}
                  onEdit={() => handleEditSubGoal(goal, goalIndex)}
                  isDragging={activeSubGoalId === goal.id}
                />
              );
            })}
            
            {/* Add Sub-Goal Card */}
            <SubGoalAddCard 
              onClick={handleAddSubGoal} 
              index={subGoals.length}
            />
          </div>
        </SortableContext>
        
        {/* Drag overlay for dragged cards */}
        <DragOverlay adjustScale={true}>
          {activeSubGoal ? (
            <GoalCard
              title={activeSubGoal.title}
              description={activeSubGoal.description}
              progress={activeSubGoal.progress}
              index={0}
              isFocused={false}
              isActiveFocus={false}
              onFocus={() => {}}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      
      {/* Sub-Goal Dialog for adding/editing */}
      <SubGoalDialog
        isOpen={isSubGoalDialogOpen}
        onClose={() => {
          setIsSubGoalDialogOpen(false);
          setSubGoalToEdit(null);
          setEditingGoalIndex(null);
        }}
        onSave={handleSaveSubGoal}
        subGoalToEdit={subGoalToEdit}
        parentGoalTitle={parentTitle}
        parentGoalId={parentId}
      />
    </>
  );
};

export default SubGoalsSection;
