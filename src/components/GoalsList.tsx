
import React from "react";
import GoalRow, { Goal } from "@/components/GoalRow";
import { Button } from "@/components/ui/button";
import AnimatedContainer from "./AnimatedContainer";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ParentGoal } from "./index/IndexPageTypes";

interface GoalsListProps {
  parentGoals: ParentGoal[];
  activeGoalIndices: {rowIndex: number, goalIndex: number} | null;
  onGoalFocus: (goal: Goal, rowIndex: number, goalIndex: number) => void;
  onUpdateSubGoals: (parentIndex: number, updatedGoals: Goal[]) => void;
  onEditGoal: (goal: ParentGoal) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

const GoalsList: React.FC<GoalsListProps> = ({ 
  parentGoals, 
  activeGoalIndices, 
  onGoalFocus, 
  onUpdateSubGoals,
  onEditGoal,
  onDragEnd
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
    <AnimatedContainer className="w-full max-w-6xl mx-auto">
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
            <div key={parentGoal.id} className="relative mb-8 last:mb-0">
              <GoalRow
                id={parentGoal.id}
                title={parentGoal.title}
                description={parentGoal.description}
                goals={parentGoal.goals}
                index={rowIndex}
                activeGoal={activeGoalIndices}
                onGoalFocus={onGoalFocus}
                onUpdateSubGoals={onUpdateSubGoals}
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
      </DndContext>
    </AnimatedContainer>
  );
};

export default GoalsList;
