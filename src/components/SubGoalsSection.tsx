
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
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();
  
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
  
  const handleSaveSubGoal = (subGoal: Omit<Goal, 'progress'> & { id?: string, progress?: number }) => {
    const newSubGoal = {
      id: subGoal.id || `temp-${Date.now()}`,
      title: subGoal.title,
      description: subGoal.description,
      progress: subGoal.progress !== undefined ? subGoal.progress : 0
    };
    
    // If editing an existing goal
    if (subGoalToEdit && editingGoalIndex !== null) {
      const updatedGoals = [...subGoals];
      updatedGoals[editingGoalIndex] = newSubGoal;
      onUpdateSubGoals(updatedGoals);
    } else {
      // Adding a new goal
      onUpdateSubGoals([...subGoals, newSubGoal]);
    }
    
    setIsSubGoalDialogOpen(false);
    setSubGoalToEdit(null);
    setEditingGoalIndex(null);
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
      const oldIndex = subGoals.findIndex(item => item.id === active.id);
      const newIndex = subGoals.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedGoals = arrayMove(subGoals, oldIndex, newIndex);
        
        onUpdateSubGoals(reorderedGoals);
        
        // Only attempt to update server if user is authenticated
        if (user) {
          try {
            await updateSubGoalOrder(reorderedGoals);
          } catch (error) {
            console.error("Error updating sub-goal order:", error);
          }
        }
      }
    }
    
    setActiveSubGoal(null);
    setActiveSubGoalId(null);
  };
  
  const updateSubGoalOrder = async (updatedSubGoals: Goal[]) => {
    if (!user) return;
    
    try {
      const updatePromises = updatedSubGoals.map((goal, index) => {
        if (goal.id) {
          return supabase
            .from('sub_goals')
            .update({ display_order: index })
            .eq('id', goal.id);
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating sub-goal order:", error);
      throw error;
    }
  };

  const handleViewDetail = (goal: Goal) => {
    if (!goal.id) return;
    
    if (user) {
      navigate(`/projects/${goal.id}`);
    } else {
      // For guest users, show premium dialog if available
      const dialogTrigger = document.querySelector('[data-premium-trigger]') as HTMLButtonElement;
      if (dialogTrigger) {
        dialogTrigger.click();
      }
    }
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
