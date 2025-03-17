
import React from 'react';
import { SubGoal } from '@/types/goal-types';
import SortableSubGoalCard from '../SortableSubGoalCard';
import SubGoalAddCard from '../SubGoalAddCard';
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import GoalCard from '../GoalCard';

interface SubGoalDndContextProps {
  subGoals: SubGoal[];
  parentTitle: string;
  rowIndex: number;
  activeGoal?: {rowIndex: number, goalIndex: number} | null;
  onGoalFocus: (goal: SubGoal, rowIndex: number, goalIndex: number) => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  activeSubGoal: SubGoal | null;
  activeSubGoalId: string | null;
  onEdit: (goal: SubGoal, index: number) => void;
  onDelete: (subGoalId: string) => void;
  onAddSubGoal: () => void;
}

const SubGoalDndContext: React.FC<SubGoalDndContextProps> = ({
  subGoals,
  parentTitle,
  rowIndex,
  activeGoal,
  onGoalFocus,
  onDragStart,
  onDragEnd,
  activeSubGoal,
  activeSubGoalId,
  onEdit,
  onDelete,
  onAddSubGoal
}) => {
  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    })
  );

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
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
                onEdit={() => onEdit(goal, goalIndex)}
                onDelete={goal.id ? () => onDelete(goal.id as string) : undefined}
                isDragging={activeSubGoalId === goal.id}
              />
            );
          })}
          
          {/* Add Sub-Goal Card */}
          <SubGoalAddCard 
            onClick={onAddSubGoal} 
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
  );
};

export default SubGoalDndContext;
