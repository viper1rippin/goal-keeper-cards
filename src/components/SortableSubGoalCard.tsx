
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import GoalCard from "./GoalCard";
import { Goal } from "./GoalRow";
import GoalCardDragHandle from "./GoalCardDragHandle";

interface SortableSubGoalCardProps {
  goal: Goal;
  index: number;
  isActiveGoal: boolean;
  onGoalFocus: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
  onViewDetail?: () => void;
}

const SortableSubGoalCard = ({
  goal,
  index,
  isActiveGoal,
  onGoalFocus,
  onEdit,
  onDelete,
  isDragging,
  onViewDetail
}: SortableSubGoalCardProps) => {
  // Setup sortable hook with improved configuration
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ 
    id: goal.id || `goal-${index}`,
    data: {
      goal,
      index
    }
  });

  // Apply dnd-kit styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
    zIndex: isSortableDragging ? 10 : 'auto'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-manipulation relative"
    >
      <GoalCard
        title={goal.title}
        description={goal.description}
        progress={goal.progress}
        index={index}
        isFocused={isActiveGoal}
        onFocus={onGoalFocus}
        isActiveFocus={isActiveGoal}
        onEdit={onEdit}
        isDragging={isDragging || isSortableDragging}
        onDelete={onDelete}
        onViewDetail={onViewDetail}
      />
      <div 
        className="absolute top-0 left-0 w-full h-10 cursor-grab"
        {...attributes}
        {...listeners}
      />
    </div>
  );
};

export default SortableSubGoalCard;
