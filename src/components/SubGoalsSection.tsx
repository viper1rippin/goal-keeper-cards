import React, { useState, useEffect } from 'react';
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
  
  const [localSubGoals, setLocalSubGoals] = useState<Goal[]>(subGoals);
  
  useEffect(() => {
    setLocalSubGoals(subGoals);
  }, [subGoals]);

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
    onUpdateSubGoals(localSubGoals);
  };
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveSubGoalId(active.id as string);
    
    const draggedGoal = active.data.current?.goal as Goal;
    if (draggedGoal) {
      setActiveSubGoal(draggedGoal);
      console.log("Drag started:", draggedGoal);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveSubGoal(null);
      setActiveSubGoalId(null);
      return;
    }
    
    console.log("Drag ended:", event);
    
    if (active.id !== over.id) {
      const oldIndex = localSubGoals.findIndex(item => 
        item.id === active.id || 
        (active.id as string).startsWith('goal-') && localSubGoals.indexOf(item) === parseInt((active.id as string).split('-')[1])
      );
      
      const newIndex = localSubGoals.findIndex(item => 
        item.id === over.id || 
        (over.id as string).startsWith('goal-') && localSubGoals.indexOf(item) === parseInt((over.id as string).split('-')[1])
      );
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedGoals = arrayMove(localSubGoals, oldIndex, newIndex);
        setLocalSubGoals(reorderedGoals);
        
        await saveSubGoalOrder(reorderedGoals);
        onUpdateSubGoals(reorderedGoals);
        
        toast({
          title: "Success",
          description: "Sub-goal order updated",
        });
      }
    }
    
    setActiveSubGoal(null);
    setActiveSubGoalId(null);
  };
  
  const saveSubGoalOrder = async (updatedSubGoals: Goal[]) => {
    try {
      const promises = updatedSubGoals.map((goal, index) => {
        if (!goal.id) return Promise.resolve();
        
        return supabase
          .from('sub_goals')
          .update({ 
            updated_at: new Date().toISOString(),
            display_order: index
          })
          .eq('id', goal.id);
      });
      
      await Promise.all(promises);
    } catch (error) {
      console.error("Error saving sub-goal order:", error);
      toast({
        title: "Error",
        description: "Failed to save sub-goal order. Please try again.",
        variant: "destructive",
      });
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
        subGoals={localSubGoals}
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
