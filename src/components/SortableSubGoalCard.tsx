
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import GoalCard from "./GoalCard";
import { Goal } from "./GoalRow";

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
  // Setup sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: goal.id || index.toString() });

  // Apply dnd-kit styles without animation transitions
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition, // Disable transition animation during dragging
    zIndex: isDragging ? 50 : 'auto' // Ensure dragged item stays on top
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group select-none"
      {...attributes}
      {...listeners}
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
        isDragging={isDragging}
        onDelete={onDelete}
        onViewDetail={onViewDetail}
      />
    </div>
  );
};

export default SortableSubGoalCard;
