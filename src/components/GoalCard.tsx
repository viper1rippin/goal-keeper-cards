
import { cn } from "@/lib/utils";
import AnimatedContainer from "./AnimatedContainer";
import { useMemo, useState, useRef, useEffect } from "react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Edit2 } from "lucide-react";

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
}

// Enhanced collection of emerald-toned gradients for cards
const gradientVariations = [
  "from-emerald-dark/30 to-emerald/10",
  "from-emerald/20 to-emerald-dark/30",
  "from-emerald-light/20 to-emerald-dark/20",
  "from-emerald/15 to-emerald-light/5",
  "from-emerald-dark/35 to-emerald/15",
  "from-emerald/25 to-emerald-dark/15",
];

// Enhanced collection of progress bar gradients
const progressGradientVariations = [
  "from-emerald to-emerald-light",
  "from-emerald-light to-emerald",
  "from-emerald-dark to-emerald-light",
  "from-emerald to-emerald-dark",
  "from-emerald-light to-emerald-dark",
  "from-emerald/90 to-emerald-light/90",
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
  onEdit
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
  
  // Handle mouse move for glow effect
  useEffect(() => {
    if (!cardRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      // Get card dimensions and position
      const rect = cardRef.current.getBoundingClientRect();
      
      // Calculate relative mouse position inside the card
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePos({ x, y });
    };
    
    const handleMouseEnter = () => {
      setIsHovered(true);
      setIsMouseInCard(true);
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
  }, []);

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
          isActiveFocus
            ? `bg-gradient-to-br ${cardGradient} border-emerald/50 shadow-lg shadow-emerald/40 animate-emerald-pulse`
            : isFocused 
              ? `bg-gradient-to-br ${cardGradient} border-emerald/40 shadow-lg shadow-emerald/30` 
              : isHovered
                ? `bg-gradient-to-br ${cardGradient} border-emerald/30 shadow-md shadow-emerald/25 opacity-95`
                : "bg-gradient-to-br from-slate-900/70 to-apple-dark/90 border-slate-800/50 opacity-80",
          progress === 100 && !isFocused && !isActiveFocus && "border-emerald/20 shadow-emerald/15"
        )}
        onClick={handleClick}
      >
        {/* Enhanced green lantern-like glow effect */}
        {isMouseInCard && (
          <div 
            className="absolute pointer-events-none animate-glow-move"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              width: '180px',
              height: '180px',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(5, 150, 105, 0.2) 40%, transparent 70%)',
              borderRadius: '50%',
              zIndex: 1,
              mixBlendMode: 'screen',
              filter: 'blur(8px)',
            }}
          />
        )}
        
        {/* Background subtle glow spots */}
        <div className="absolute top-1/4 right-1/4 w-20 h-20 rounded-full bg-emerald/10 blur-xl opacity-60"></div>
        <div className="absolute bottom-1/4 left-1/4 w-16 h-16 rounded-full bg-emerald-light/10 blur-xl opacity-50"></div>
        
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
        
        <div className="flex flex-col h-full relative z-2">
          <h3 className={cn(
            "font-medium text-lg mb-2",
            isActiveFocus 
              ? "text-white text-gradient" 
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
                    ? `${progressGradient} animate-pulse animate-gradient-flow` 
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
