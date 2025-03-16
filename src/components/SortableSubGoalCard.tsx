
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import GoalCard from "./GoalCard";
import { Goal } from "./GoalRow";
import { Trash2 } from "lucide-react";

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
        onDelete={onDelete}
      />
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute bottom-2 right-2 p-1.5 rounded-full bg-red-800/60 text-red-300 hover:bg-red-800/90 transition-colors z-10 opacity-0 group-hover:opacity-100"
          aria-label="Delete sub-goal"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

export default SortableSubGoalCard;
