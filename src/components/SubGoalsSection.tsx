
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
import SelectionToolbar from './SelectionToolbar';
import { SelectionProvider } from '@/context/SelectionContext';

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
        
        try {
          await updateSubGoalOrder(reorderedGoals);
        } catch (error) {
          console.error("Error updating sub-goal order:", error);
          toast({
            title: "Error",
            description: "Failed to update sub-goal order. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
    
    setActiveSubGoal(null);
    setActiveSubGoalId(null);
  };
  
  const updateSubGoalOrder = async (updatedSubGoals: Goal[]) => {
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
    
    navigate(`/projects/${goal.id}`);
  };

  const handleDeleteSelectedGoals = async (goalIds: string[]) => {
    try {
      // Call the delete function for each selected goal
      const deletePromises = goalIds.map(id => onDeleteSubGoal(id));
      await Promise.all(deletePromises);
      
      return true;
    } catch (error) {
      console.error("Error deleting multiple goals:", error);
      throw error;
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
    <SelectionProvider>
      <SelectionToolbar onDeleteSelected={handleDeleteSelectedGoals} />
      
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
    </SelectionProvider>
  );
};

export default SubGoalsSection;
