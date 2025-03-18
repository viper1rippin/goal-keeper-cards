import React, { useState } from 'react';
import { Goal } from './GoalRow';
import SubGoalDialog from './SubGoalDialog';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SubGoalDndContext from './subgoal/SubGoalDndContext';
import DeleteSubGoalDialog from './subgoal/DeleteSubGoalDialog';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
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
  
  const handleSaveSubGoal = (subGoal: Omit<Goal, 'progress'>) => {
    setIsSubGoalDialogOpen(false);
    onUpdateSubGoals(subGoals);
  };
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveSubGoalId(active.id as string);
    
    const goalId = active.id.toString();
    const draggedGoal = subGoals.find(goal => 
      goal.id === goalId || 
      (goalId.startsWith('goal-') && subGoals[parseInt(goalId.split('-')[1])] === goal)
    );
    
    if (draggedGoal) {
      setActiveSubGoal(draggedGoal);
      console.log('Drag started:', draggedGoal);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveSubGoal(null);
      setActiveSubGoalId(null);
      return;
    }
    
    console.log('Drag ended:', { active, over });
    
    if (active.id !== over.id) {
      const reorderedGoals = [...subGoals];
      
      let oldIndex = reorderedGoals.findIndex(item => item.id === active.id);
      let newIndex = reorderedGoals.findIndex(item => item.id === over.id);
      
      if (oldIndex === -1 && typeof active.id === 'string' && active.id.startsWith('goal-')) {
        oldIndex = parseInt(active.id.split('-')[1]);
      }
      
      if (newIndex === -1 && typeof over.id === 'string' && over.id.startsWith('goal-')) {
        newIndex = parseInt(over.id.split('-')[1]);
      }
      
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex < reorderedGoals.length && newIndex < reorderedGoals.length) {
        const newItems = arrayMove(reorderedGoals, oldIndex, newIndex);
        
        console.log('New order:', newItems.map(i => i.title));
        
        try {
          await saveSubGoalOrder(newItems);
          onUpdateSubGoals(newItems);
          
          toast({
            title: "Success",
            description: "Sub-goal order updated",
          });
        } catch (error) {
          console.error('Error saving sub-goal order:', error);
          toast({
            title: "Error",
            description: "Failed to update sub-goal order",
            variant: "destructive"
          });
        }
      }
    }
    
    setActiveSubGoal(null);
    setActiveSubGoalId(null);
  };
  
  const saveSubGoalOrder = async (updatedSubGoals: Goal[]) => {
    try {
      const goalsWithIds = updatedSubGoals.filter(goal => goal.id);
      
      for (let i = 0; i < goalsWithIds.length; i++) {
        const goal = goalsWithIds[i];
        if (!goal.id) continue;
        
        const { error } = await supabase
          .from('sub_goals')
          .update({ 
            position: i,
            updated_at: new Date().toISOString()
          })
          .eq('id', goal.id);
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error saving sub-goal order:", error);
      toast({
        title: "Error",
        description: "Failed to save sub-goal order. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleViewDetail = (goal: Goal) => {
    if (!goal.id) return;
    
    navigate(`/projects/${goal.id}`);
  };

  if (isLoading) {
    return (
      <div className="py-4 text-center text-slate-400">
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
        onViewDetail={handleViewDetail}
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
