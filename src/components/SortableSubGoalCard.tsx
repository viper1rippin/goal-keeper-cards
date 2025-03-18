
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import GoalCard from "./GoalCard";
import { Goal } from "./GoalRow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  // Handle view detail navigation
  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail();
    } else if (goal.id && user) {
      // If user is authenticated, navigate to project details
      navigate(`/projects/${goal.id}`);
    } else if (!user) {
      // Show toast for guests
      toast({
        title: "Premium Feature",
        description: "Sign up to access mind maps and project notes.",
      });
      
      // Try to open premium dialog if available
      const dialogTrigger = document.querySelector('[data-premium-trigger]') as HTMLButtonElement;
      if (dialogTrigger) {
        dialogTrigger.click();
      }
    }
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
        onViewDetail={handleViewDetail}
      />
    </div>
  );
};

export default SortableSubGoalCard;
