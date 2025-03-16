
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import { useMemo, useState, useRef, useEffect } from "react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Edit2, GripHorizontal } from "lucide-react";

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
  // Add drag state
  isDragging?: boolean;
}

// Collection of emerald-toned gradients for cards
const gradientVariations = [
  "from-emerald-dark/30 to-apple-dark",
  "from-emerald-dark/40 to-emerald/10",
  "from-emerald/15 to-apple-dark",
  "from-emerald-light/15 to-apple-dark",
  "from-emerald/10 to-emerald-dark/25",
  "from-emerald-dark/35 to-emerald/15",
];

// Collection of progress bar gradients
const progressGradientVariations = [
  "from-emerald to-emerald-light",
  "from-emerald-light to-emerald",
  "from-emerald-dark to-emerald",
  "from-emerald to-emerald-dark",
  "from-emerald-light/90 to-emerald",
  "from-emerald/90 to-emerald-light",
];

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
  isDragging = false
}: GoalCardProps) => {
  // Calculate delay based on index for staggered animation
  const delay = 150 + index * 50;
  
  // State to track hover status
  const [isHovered, setIsHovered] = useState(false);
  
  // Refs for tracking mouse position and card element
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMouseInCard, setIsMouseInCard] = useState(false);
  
  // Generate a consistent gradient for each card based on the title
  const cardGradient = useMemo(() => {
    // Use the title to create a deterministic but seemingly random index
    const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const gradientIndex = charSum % gradientVariations.length;
    return gradientVariations[gradientIndex];
  }, [title]);
  
  // Generate a consistent gradient for each progress bar based on the title
  const progressGradient = useMemo(() => {
    const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const gradientIndex = charSum % progressGradientVariations.length;
    return progressGradientVariations[gradientIndex];
  }, [title]);
  
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
  }, [isActiveFocus]); // Added isActiveFocus to dependency array

  // Reset mouse state when active focus changes
  useEffect(() => {
    if (!isActiveFocus) {
      setIsMouseInCard(false);
    }
  }, [isActiveFocus]);

  // Handle card click to start focus timer
  const handleClick = () => {
    onFocus(); // Toggle focus state as before
    if (onStartFocus) {
      onStartFocus(); // Start focus timer with this goal
    }
  };
  
  return (
    <AnimatedContainer 
      animation="scale-in"
      delay={delay}
      className="w-full"
    >
      <div 
        ref={cardRef}
        className={cn(
          "glass-card rounded-lg p-5 h-full hover-scale transition-all duration-300 relative overflow-hidden",
          // Only use the active gradients when this card is the active focused card
          isActiveFocus
            ? `bg-gradient-to-br ${cardGradient} border-emerald/30 shadow-lg shadow-emerald/20`
            : isFocused 
              ? `bg-gradient-to-br ${cardGradient} border-emerald/25 shadow-md shadow-emerald/15` 
              : isHovered
                ? `bg-gradient-to-br ${cardGradient} border-emerald/15 shadow-sm shadow-emerald/10 opacity-90`
                : "bg-slate-900/80 border-slate-800/60 opacity-75",
          progress === 100 && !isFocused && !isActiveFocus && "border-emerald/15",
          isDragging ? "ring-2 ring-emerald/50 shadow-xl scale-105" : ""
        )}
        onClick={handleClick}
      >
        {/* Drag handle indicator */}
        <div className="absolute top-2 left-2 p-1.5 text-slate-500 opacity-50 hover:opacity-100 transition-opacity cursor-grab">
          <GripHorizontal size={14} />
        </div>
        
        {/* Subtle, focused glow effect that follows the mouse - only shown when card has active focus */}
        {isMouseInCard && isActiveFocus && (
          <div 
            className="absolute pointer-events-none"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              width: '80px',
              height: '80px',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 40%, transparent 80%)',
              borderRadius: '50%',
              zIndex: 1,
              mixBlendMode: 'soft-light',
              filter: 'blur(12px)',
              opacity: 0.7,
            }}
          />
        )}
        
        {/* Subtle depth-enhancing gradient overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)',
            zIndex: 0,
          }}
        />
        
        {/* Edit button - only visible on hover */}
        {onEdit && isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800/70 text-emerald hover:bg-slate-700/80 transition-colors z-10"
            aria-label="Edit sub-goal"
          >
            <Edit2 size={14} />
          </button>
        )}
        
        <div className="flex flex-col h-full relative z-2 pt-4">
          <h3 className={cn(
            "font-medium text-lg mb-2",
            isActiveFocus 
              ? "text-white" 
              : (isFocused || isHovered ? "text-slate-100" : "text-slate-400")
          )}>{title}</h3>
          <p className={cn(
            "text-sm flex-1 mb-4",
            isActiveFocus 
              ? "text-slate-200" 
              : (isFocused || isHovered ? "text-slate-300" : "text-slate-500")
          )}>{description}</p>
          
          <div className="mt-auto">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full bg-gradient-to-r transition-all duration-700 ease-out",
                  isActiveFocus 
                    ? `${progressGradient}` 
                    : (isFocused || isHovered ? progressGradient : "from-emerald/40 to-emerald-light/40")
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default GoalCard;
