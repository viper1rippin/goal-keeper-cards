import { cn } from "@/lib/utils";
import GoalCard, { GoalCardProps } from "./GoalCard";
import AnimatedContainer from "./AnimatedContainer";
import { useState, useEffect } from "react";
import SubGoalAddCard from "./SubGoalAddCard";
import SubGoalDialog from "./SubGoalDialog";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  Active
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
  useSortable as useSortableItem
} from '@dnd-kit/sortable';

export interface Goal {
  id?: string;
  title: string;
  description: string;
  progress: number;
}

interface GoalRowProps {
  title: string;
  description: string;
  goals: Goal[];
  index: number;
  activeGoal?: {rowIndex: number, goalIndex: number} | null;
  onGoalFocus: (goal: Goal, rowIndex: number, goalIndex: number) => void;
  onUpdateSubGoals: (parentIndex: number, updatedGoals: Goal[]) => void;
  id: string; // Added id prop for drag and drop
}

const GoalRow = ({ 
  title, 
  description, 
  goals, 
  index: rowIndex,
  activeGoal,
  onGoalFocus,
  onUpdateSubGoals,
  id
}: GoalRowProps) => {
  // Setup sortable hook from dnd-kit for the row itself
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const { toast } = useToast();
  
  // State for sub-goals loaded from the database
  const [subGoals, setSubGoals] = useState<Goal[]>(goals);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for drag and drop of sub-goals
  const [activeSubGoal, setActiveSubGoal] = useState<Goal | null>(null);
  const [activeSubGoalId, setActiveSubGoalId] = useState<string | null>(null);

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    })
  );

  // Apply transform styles from dnd-kit for the row
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  // Calculate delay based on row index for staggered animation
  const rowDelay = rowIndex * 100;
  
  // State for sub-goal dialog
  const [isSubGoalDialogOpen, setIsSubGoalDialogOpen] = useState(false);
  const [subGoalToEdit, setSubGoalToEdit] = useState<Goal | null>(null);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  
  // Fetch sub-goals for this parent goal
  const fetchSubGoals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sub_goals')
        .select('*')
        .eq('parent_goal_id', id)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedData = data.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          progress: goal.progress
        }));
        
        setSubGoals(formattedData);
        // Also update the parent component's state
        onUpdateSubGoals(rowIndex, formattedData);
      }
    } catch (error) {
      console.error("Error fetching sub-goals:", error);
      toast({
        title: "Error",
        description: "Failed to load sub-goals. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch sub-goals when the component mounts
  useEffect(() => {
    fetchSubGoals();
  }, [id]);
  
  // Handle adding a new sub-goal
  const handleAddSubGoal = () => {
    setSubGoalToEdit(null);
    setEditingGoalIndex(null);
    setIsSubGoalDialogOpen(true);
  };
  
  // Handle editing an existing sub-goal
  const handleEditSubGoal = (goal: Goal, index: number) => {
    setSubGoalToEdit(goal);
    setEditingGoalIndex(index);
    setIsSubGoalDialogOpen(true);
  };
  
  // Handle saving sub-goal (both add and edit)
  const handleSaveSubGoal = (subGoal: Omit<Goal, 'progress'>) => {
    // Close the dialog and refresh sub-goals
    setIsSubGoalDialogOpen(false);
    fetchSubGoals();
  };
  
  // Handle drag start for sub-goals
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveSubGoalId(active.id as string);
    const draggedGoal = subGoals.find(goal => goal.id === active.id);
    if (draggedGoal) {
      setActiveSubGoal(draggedGoal);
    }
  };

  // Handle drag end for sub-goals
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      setSubGoals((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        // Reorder the items
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Save the new order to the database
        saveSubGoalOrder(newItems);
        
        // Update the parent component
        onUpdateSubGoals(rowIndex, newItems);
        
        return newItems;
      });
    }
    
    // Clear the active sub-goal when dragging ends
    setActiveSubGoal(null);
    setActiveSubGoalId(null);
  };
  
  // Save the updated order of sub-goals to the database
  const saveSubGoalOrder = async (updatedSubGoals: Goal[]) => {
    try {
      // Since there's no position field in the database,
      // we'll need to update the goals one by one with a timestamp to maintain order
      // We'll use the updated_at field to maintain order
      for (let i = 0; i < updatedSubGoals.length; i++) {
        if (updatedSubGoals[i].id) {
          // Add a small delay between updates to ensure ordering by updated_at works correctly
          const delayOffset = i * 50; // 50ms spacing between updates
          
          setTimeout(async () => {
            const { error } = await supabase
              .from('sub_goals')
              .update({ 
                updated_at: new Date().toISOString()
              })
              .eq('id', updatedSubGoals[i].id);
            
            if (error) throw error;
          }, delayOffset);
        }
      }
    } catch (error) {
      console.error("Error saving sub-goal order:", error);
      toast({
        title: "Error",
        description: "Failed to save sub-goal order. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="mb-12 last:mb-0 relative"
    >
      <AnimatedContainer 
        animation="fade-in" 
        delay={rowDelay}
      >
        <div className="mb-4 flex items-start">
          <div 
            className="mt-2 mr-3 cursor-grab p-1 hover:bg-slate-800/50 rounded text-slate-500 hover:text-emerald transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </div>
          <div className="flex-1">
            <div className="py-1 px-3 bg-slate-800/50 rounded-md inline-block mb-2">
              <span className="text-xs font-medium text-emerald/90">Parent Goal</span>
            </div>
            <h2 className="text-2xl font-semibold mb-1">{title}</h2>
            <p className="text-slate-400">{description}</p>
          </div>
        </div>
        
        <div className="pl-8">
          {isLoading ? (
            <div className="col-span-4 py-8 text-center text-slate-400">
              Loading sub-goals...
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
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
                        onEdit={() => handleEditSubGoal(goal, goalIndex)}
                        isDragging={activeSubGoalId === goal.id}
                      />
                    );
                  })}
                  
                  {/* Add Sub-Goal Card */}
                  <SubGoalAddCard 
                    onClick={handleAddSubGoal} 
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
          )}
        </div>
        
        {/* Sub-Goal Dialog for adding/editing */}
        <SubGoalDialog
          isOpen={isSubGoalDialogOpen}
          onClose={() => {
            setIsSubGoalDialogOpen(false);
            setSubGoalToEdit(null);
            setEditingGoalIndex(null);
          }}
          onSave={handleSaveSubGoal}
          subGoalToEdit={subGoalToEdit}
          parentGoalTitle={title}
          parentGoalId={id}
        />
      </AnimatedContainer>
    </div>
  );
};

// Component for sortable sub-goal cards
interface SortableSubGoalCardProps {
  goal: Goal;
  index: number;
  isActiveGoal: boolean;
  onGoalFocus: () => void;
  onEdit: () => void;
  isDragging: boolean;
}

const SortableSubGoalCard = ({ 
  goal, 
  index, 
  isActiveGoal, 
  onGoalFocus, 
  onEdit,
  isDragging 
}: SortableSubGoalCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortableItem({
    id: goal.id || '',
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.3 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-manipulation">
      <GoalCard 
        title={goal.title}
        description={goal.description}
        progress={goal.progress}
        index={index}
        isFocused={isActiveGoal}
        isActiveFocus={isActiveGoal}
        onFocus={onGoalFocus}
        onStartFocus={onGoalFocus}
        onEdit={onEdit}
        isDragging={isDragging}
      />
    </div>
  );
};

export default GoalRow;
