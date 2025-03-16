
import React, { useState } from "react";
import GoalRow, { Goal } from "@/components/GoalRow";
import { Button } from "@/components/ui/button";
import AnimatedContainer from "./AnimatedContainer";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ParentGoal } from "./index/IndexPageTypes";
import TrashZone from "./TrashZone";

interface GoalsListProps {
  parentGoals: ParentGoal[];
  activeGoalIndices: {rowIndex: number, goalIndex: number} | null;
  onGoalFocus: (goal: Goal, rowIndex: number, goalIndex: number) => void;
  onUpdateSubGoals: (parentIndex: number, updatedGoals: Goal[]) => void;
  onEditGoal: (goal: ParentGoal) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDeleteParentGoal: (id: string) => void;
  onDeleteSubGoal: (id: string) => void;
}

const GoalsList: React.FC<GoalsListProps> = ({ 
  parentGoals, 
  activeGoalIndices, 
  onGoalFocus, 
  onUpdateSubGoals,
  onEditGoal,
  onDragEnd,
  onDeleteParentGoal,
  onDeleteSubGoal
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'parent' | 'sub' | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setIsDragging(true);
    setActiveId(active.id as string);
    
    // Determine if we're dragging a parent or sub goal
    const isParentGoal = parentGoals.some(goal => goal.id === active.id);
    setActiveType(isParentGoal ? 'parent' : 'sub');
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Check if we're over the trash zone
    if (event.over && event.over.id === 'trash-zone') {
      setIsOverTrash(true);
    } else {
      setIsOverTrash(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Check if we're dropping on the trash zone
    if (over && over.id === 'trash-zone' && activeId) {
      if (activeType === 'parent') {
        onDeleteParentGoal(activeId);
      } else if (activeType === 'sub') {
        onDeleteSubGoal(activeId);
      }
    } else {
      // Handle normal drag end
      onDragEnd(event);
    }
    
    // Reset state
    setIsDragging(false);
    setIsOverTrash(false);
    setActiveId(null);
    setActiveType(null);
  };

  return (
    <AnimatedContainer className="max-w-7xl mx-auto">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
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
                onGoalFocus={onGoalFocus}
                onUpdateSubGoals={onUpdateSubGoals}
                onDeleteSubGoal={onDeleteSubGoal}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 text-slate-400 hover:text-white hover:bg-slate-800/30"
                onClick={() => onEditGoal(parentGoal)}
              >
                Edit
              </Button>
            </div>
          ))}
        </SortableContext>

        {/* Trash zone - only visible during drag operations */}
        {isDragging && (
          <div id="trash-zone" data-id="trash-zone">
            <TrashZone isVisible={isDragging} isOver={isOverTrash} />
          </div>
        )}
      </DndContext>
    </AnimatedContainer>
  );
};

export default GoalsList;
