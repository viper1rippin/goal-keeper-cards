
import React from 'react';
import { Goal } from '../GoalRow';
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
  DragOverlay,
  MouseSensor,
  TouchSensor,
  MeasuringStrategy
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import GoalCard from '../GoalCard';

interface SubGoalDndContextProps {
  subGoals: Goal[];
  parentTitle: string;
  rowIndex: number;
  activeGoal?: {rowIndex: number, goalIndex: number} | null;
  onGoalFocus: (goal: Goal, rowIndex: number, goalIndex: number) => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  activeSubGoal: Goal | null;
  activeSubGoalId: string | null;
  onEdit: (goal: Goal, index: number) => void;
  onDelete: (subGoalId: string) => void;
  onAddSubGoal: () => void;
  onViewDetail?: (goal: Goal) => void;
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
  onAddSubGoal,
  onViewDetail
}) => {
  // Setup sensors for drag and drop with improved configuration
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 8 pixels before activating
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 100ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      // Require the pointer to move by 8 pixels before activating
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Use unique IDs for goals, fallback to index if no ID
  const itemIds = subGoals.map(goal => goal.id || `goal-${subGoals.indexOf(goal)}`);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always
        },
      }}
    >
      <SortableContext 
        items={itemIds}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subGoals.map((goal, goalIndex) => {
            const isActiveGoal = activeGoal?.rowIndex === rowIndex && activeGoal?.goalIndex === goalIndex;
            
            return (
              <SortableSubGoalCard 
                key={goal.id || `goal-${goalIndex}`}
                goal={goal}
                index={goalIndex}
                isActiveGoal={isActiveGoal}
                onGoalFocus={() => onGoalFocus(goal, rowIndex, goalIndex)}
                onEdit={() => onEdit(goal, goalIndex)}
                onDelete={goal.id ? () => onDelete(goal.id as string) : undefined}
                isDragging={activeSubGoalId === goal.id}
                onViewDetail={onViewDetail ? () => onViewDetail(goal) : undefined}
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
