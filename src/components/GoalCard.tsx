
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import { useMemo, useState, useRef, useEffect } from "react";
import { getCardGradient, getProgressGradient } from "./GoalCardGradients";
import GoalCardContent from "./GoalCardContent";
import GoalCardGlow from "./GoalCardGlow";
import GoalCardEditButton from "./GoalCardEditButton";
import GoalCardDragHandle from "./GoalCardDragHandle";
import { useTheme } from "@/context/ThemeContext";

export interface GoalCardProps {
  title: string;
  description: string;
  progress: number;
  index: number;
  isFocused: boolean;
  onFocus: () => void;
  // Add new props for focus timer
  isActiveFocus?: boolean;
  onStartFocus?: () => void;
  // Add edit functionality
  onEdit?: () => void;
  // Add delete functionality
  onDelete?: () => void;
  // Add drag state
  isDragging?: boolean;
  // Add new prop for navigating to project detail
  onViewDetail?: () => void;
}

const GoalCard = ({ 
  title, 
  description, 
  progress, 
  index, 
  isFocused, 
  onFocus, 
  isActiveFocus = false,
  onStartFocus,
  onEdit,
  onDelete,
  isDragging = false,
  onViewDetail
}: GoalCardProps) => {
  // Calculate delay based on index for staggered animation
  const delay = 150 + index * 50;
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // State to track hover status
  const [isHovered, setIsHovered] = useState(false);
  
  // Refs for tracking mouse position and card element
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMouseInCard, setIsMouseInCard] = useState(false);
  
  // Generate a consistent gradient for each card based on the title
  const cardGradient = useMemo(() => getCardGradient(title), [title]);
  
  // Generate a consistent gradient for each progress bar based on the title
  const progressGradient = useMemo(() => getProgressGradient(title), [title]);
  
  // Handle mouse move for refined glow effect
  useEffect(() => {
    if (!cardRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !isActiveFocus) return;
      
      // Get card dimensions and position
      const rect = cardRef.current.getBoundingClientRect();
      
      // Calculate relative mouse position inside the card
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePos({ x, y });
    };
    
    const handleMouseEnter = () => {
      setIsHovered(true);
      setIsMouseInCard(isActiveFocus); // Only set mouse in card if this card has active focus
    };
    
    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsMouseInCard(false);
    };
    
    const card = cardRef.current;
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isActiveFocus]);

  // Reset mouse state when active focus changes
  useEffect(() => {
    if (!isActiveFocus) {
      setIsMouseInCard(false);
    }
  }, [isActiveFocus]);

  // Handle card click - only select the goal, don't start timer
  const handleClick = () => {
    onFocus(); // Keep the focus state toggling
    
    // If we have a handler for viewing details, call it
    if (onViewDetail) {
      onViewDetail();
    }
  };
  
  return (
    <AnimatedContainer 
      animation="scale-in"
      delay={delay}
      className="w-full group"
    >
      <div 
        ref={cardRef}
        className={cn(
          "glass-card rounded-lg p-4 h-full hover-scale transition-all duration-300 relative overflow-hidden",
          // Only use the active gradients when this card is the active focused card
          isActiveFocus
            ? `bg-gradient-to-br ${cardGradient} ${isDarkMode ? 'border-emerald/30' : 'border-emerald/20'} shadow-lg ${isDarkMode ? 'shadow-emerald/20' : 'shadow-emerald/10'}`
            : isFocused 
              ? `bg-gradient-to-br ${cardGradient} ${isDarkMode ? 'border-emerald/25' : 'border-emerald/15'} shadow-md ${isDarkMode ? 'shadow-emerald/15' : 'shadow-emerald/5'}` 
              : isHovered
                ? `bg-gradient-to-br ${cardGradient} ${isDarkMode ? 'border-emerald/15' : 'border-emerald/10'} shadow-sm ${isDarkMode ? 'shadow-emerald/10' : 'shadow-emerald/5'} opacity-90`
                : isDarkMode 
                  ? "bg-slate-900/80 border-slate-800/60 opacity-75" 
                  : "bg-white border-slate-200/80 opacity-90",
          progress === 100 && !isFocused && !isActiveFocus && isDarkMode ? "border-emerald/15" : progress === 100 && !isFocused && !isActiveFocus ? "border-emerald/10" : "",
          isDragging ? "ring-2 ring-emerald/50 shadow-xl scale-105" : ""
        )}
        onClick={handleClick}
      >
        {/* Drag handle indicator */}
        <GoalCardDragHandle />
        
        {/* Subtle, focused glow effect that follows the mouse - only shown when card has active focus */}
        <GoalCardGlow 
          isMouseInCard={isMouseInCard} 
          isActiveFocus={isActiveFocus} 
          mousePos={mousePos} 
        />
        
        {/* Subtle depth-enhancing gradient overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)'
              : 'linear-gradient(145deg, rgba(255,255,255,0.7) 0%, transparent 60%, rgba(0,0,0,0.03) 100%)',
            zIndex: 0,
          }}
        />
        
        {/* Edit button - only visible on hover */}
        <GoalCardEditButton isHovered={isHovered} onEdit={onEdit} />
        
        {/* Content area with title, description and progress */}
        <GoalCardContent
          title={title}
          description={description}
          progress={progress}
          progressGradient={progressGradient}
          isActiveFocus={isActiveFocus}
          isFocused={isFocused}
          isHovered={isHovered}
        />
      </div>
    </AnimatedContainer>
  );
};

export default GoalCard;
