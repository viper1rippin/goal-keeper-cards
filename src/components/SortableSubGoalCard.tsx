
import { Goal } from "./GoalRow";
import GoalCard from "./GoalCard";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

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
  } = useSortable({
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

export default SortableSubGoalCard;
