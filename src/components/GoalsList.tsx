
import React from "react";
import GoalRow, { Goal } from "@/components/GoalRow";
import { Button } from "@/components/ui/button";
import AnimatedContainer from "./AnimatedContainer";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ParentGoal } from "./index/IndexPageTypes";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
              <div className="absolute top-0 right-0 flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white hover:bg-slate-800/30"
                  onClick={() => onEditGoal(parentGoal)}
                >
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Delete Goal</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        Are you sure you want to delete "{parentGoal.title}" and all its sub-goals?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => onDeleteParentGoal(parentGoal.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </SortableContext>
      </DndContext>
    </AnimatedContainer>
  );
};

export default GoalsList;
