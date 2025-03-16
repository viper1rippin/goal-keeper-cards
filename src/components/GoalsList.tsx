
import React from "react";
import GoalRow, { Goal } from "@/components/GoalRow";
import AnimatedContainer from "./AnimatedContainer";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ParentGoal } from "./index/IndexPageTypes";
import GoalRowActions from "./parentgoal/GoalRowActions";

interface GoalsListProps {
  parentGoals: ParentGoal[];
  activeGoalIndices: {rowIndex: number, goalIndex: number} | null;
  onGoalFocus: (goal: Goal, rowIndex: number, goalIndex: number) => void;
  onUpdateSubGoals: (parentIndex: number, updatedGoals: Goal[]) => void;
  onEditGoal: (goal: ParentGoal) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDeleteParentGoal: (id: string) => Promise<void>;
  onDeleteSubGoal: (id: string, parentIndex: number) => Promise<void>;
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

  return (
    <AnimatedContainer className="max-w-7xl mx-auto">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
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
                onDeleteSubGoal={(subGoalId) => onDeleteSubGoal(subGoalId, rowIndex)}
              />
              <GoalRowActions
                title={parentGoal.title}
                onEdit={() => onEditGoal(parentGoal)}
                onDelete={async () => Promise.resolve()} // Return a resolved Promise to match the expected type
              />
            </div>
          ))}
        </SortableContext>
      </DndContext>
    </AnimatedContainer>
  );
};

export default GoalsList;
