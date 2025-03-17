
import React, { useState } from 'react';
import { Goal } from './GoalRow';
import SubGoalDialog, { SubGoalData } from './SubGoalDialog';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SubGoalDndContext from './subgoal/SubGoalDndContext';
import DeleteSubGoalDialog from './subgoal/DeleteSubGoalDialog';

interface SubGoalsSectionProps {
  subGoals: Goal[];
  parentTitle: string;
  parentId: string;
  rowIndex: number;
  activeGoal?: {rowIndex: number, goalIndex: number} | null;
  onGoalFocus: (goal: Goal, rowIndex: number, goalIndex: number) => void;
  onUpdateSubGoals: (updatedGoals: Goal[]) => void;
  onDeleteSubGoal: (subGoalId: string) => Promise<void>;
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
  onDeleteSubGoal,
  isLoading
}) => {
  const { toast } = useToast();
  
  const [activeSubGoal, setActiveSubGoal] = useState<Goal | null>(null);
  const [activeSubGoalId, setActiveSubGoalId] = useState<string | null>(null);
  
  const [isSubGoalDialogOpen, setIsSubGoalDialogOpen] = useState(false);
  const [subGoalToEdit, setSubGoalToEdit] = useState<Goal | null>(null);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  
  const [subGoalToDelete, setSubGoalToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddSubGoal = () => {
    setSubGoalToEdit(null);
    setEditingGoalIndex(null);
    setIsSubGoalDialogOpen(true);
  };
  
  const handleEditSubGoal = (goal: Goal, index: number) => {
    setSubGoalToEdit(goal);
    setEditingGoalIndex(index);
    setIsSubGoalDialogOpen(true);
  };
  
  const handleConfirmDeleteSubGoal = (subGoalId: string) => {
    setSubGoalToDelete(subGoalId);
    setIsDeleteDialogOpen(true);
  };
  
  const executeDeleteSubGoal = async () => {
    if (subGoalToDelete) {
      await onDeleteSubGoal(subGoalToDelete);
      setSubGoalToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleSaveSubGoal = (subGoal: SubGoalData) => {
    setIsSubGoalDialogOpen(false);
    onUpdateSubGoals(subGoals);
  };
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveSubGoalId(active.id as string);
    const draggedGoal = subGoals.find(goal => goal.id === active.id);
    if (draggedGoal) {
      setActiveSubGoal(draggedGoal);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      const reorderedGoals = [...subGoals];
      const oldIndex = reorderedGoals.findIndex(item => item.id === active.id);
      const newIndex = reorderedGoals.findIndex(item => item.id === over.id);
      
      const newItems = arrayMove(reorderedGoals, oldIndex, newIndex);
      
      await saveSubGoalOrder(newItems);
      
      onUpdateSubGoals(newItems);
    }
    
    setActiveSubGoal(null);
    setActiveSubGoalId(null);
  };
  
  const saveSubGoalOrder = async (updatedSubGoals: Goal[]) => {
    try {
      for (let i = 0; i < updatedSubGoals.length; i++) {
        if (updatedSubGoals[i].id) {
          const delayOffset = i * 50;
          
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
      <SubGoalDndContext
        subGoals={subGoals}
        parentTitle={parentTitle}
        rowIndex={rowIndex}
        activeGoal={activeGoal}
        onGoalFocus={onGoalFocus}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        activeSubGoal={activeSubGoal}
        activeSubGoalId={activeSubGoalId}
        onEdit={handleEditSubGoal}
        onDelete={handleConfirmDeleteSubGoal}
        onAddSubGoal={handleAddSubGoal}
      />
      
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
        onDelete={onDeleteSubGoal}
      />
      
      <DeleteSubGoalDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDeleteSubGoal}
      />
    </>
  );
};

export default SubGoalsSection;
