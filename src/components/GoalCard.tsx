
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
  
  // State to track hover status
  const [isHovered, setIsHovered] = useState(false);
  
  // Refs for tracking mouse position and card element
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMouseInCard, setIsMouseInCard] = useState(false);
  
  // Get current theme
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  
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
          // Light mode styles
          isLightMode && "bg-white/80 border-gold-light/30 shadow-md",
          // Only use the active gradients when this card is the active focused card
          isActiveFocus
            ? isLightMode 
              ? "bg-gradient-to-br from-gold-light/40 to-ocean-light/30 border-gold/30 shadow-lg" 
              : `bg-gradient-to-br ${cardGradient} border-emerald/30 shadow-lg shadow-emerald/20`
            : isFocused 
              ? isLightMode
                ? "bg-gradient-to-br from-gold-light/30 to-ocean-light/20 border-gold/20 shadow-md"
                : `bg-gradient-to-br ${cardGradient} border-emerald/25 shadow-md shadow-emerald/15` 
              : isHovered
                ? isLightMode
                  ? "bg-gradient-to-br from-gold-light/20 to-ocean-light/10 border-gold/15 shadow-sm opacity-95"
                  : `bg-gradient-to-br ${cardGradient} border-emerald/15 shadow-sm shadow-emerald/10 opacity-90`
                : isLightMode
                  ? "bg-white/60 border-gold-light/20 opacity-85"
                  : "bg-slate-900/80 border-slate-800/60 opacity-75",
          progress === 100 && !isFocused && !isActiveFocus && (isLightMode ? "border-gold/20" : "border-emerald/15"),
          isDragging ? isLightMode ? "ring-2 ring-gold/50 shadow-xl scale-105" : "ring-2 ring-emerald/50 shadow-xl scale-105" : ""
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
          isLightMode={isLightMode}
        />
        
        {/* Subtle depth-enhancing gradient overlay */}
        <div 
          className={cn(
            "absolute inset-0 pointer-events-none",
            isLightMode ? "opacity-10" : "opacity-15"
          )}
          style={{
            background: isLightMode 
              ? 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, transparent 50%, rgba(14,165,233,0.05) 100%)'
              : 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)',
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
          isLightMode={isLightMode}
        />
      </div>
    </AnimatedContainer>
  );
};

export default GoalCard;
