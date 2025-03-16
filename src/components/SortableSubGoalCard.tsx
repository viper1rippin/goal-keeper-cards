
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
}

const SortableSubGoalCard = ({
  goal,
  index,
  isActiveGoal,
  onGoalFocus,
  onEdit,
  onDelete,
  isDragging
}: SortableSubGoalCardProps) => {
  // Setup sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: goal.id || index.toString() });

  // Apply dnd-kit styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative"
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
        onDelete={null}  // Remove the onDelete prop
      />
    </div>
  );
};

export default SortableSubGoalCard;
