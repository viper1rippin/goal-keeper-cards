
import React, { useState, useRef } from "react";
import { SubGoalTimelineItem, TimelineViewMode } from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Edit2, GripHorizontal, AlertTriangle, Star, Package, Monitor, Cpu } from "lucide-react";

interface TimelineCardProps {
  item: SubGoalTimelineItem;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onResize?: (itemId: string, newDuration: number) => void;
  cellWidth: number;
  viewMode: TimelineViewMode;
}

const TimelineCard = ({ 
  item, 
  isSelected, 
  onSelect, 
  onEdit,
  onResize,
  cellWidth,
  viewMode
}: TimelineCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [initialDuration, setInitialDuration] = useState(item.duration);
  
  const resizeRef = useRef<HTMLDivElement>(null);
  
  // Setup sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  // Calculate minimum width based on text length to ensure title visibility
  const calculateMinWidth = () => {
    const titleLength = item.title?.length || 0;
    // Ensure at least 10px per character with a minimum of 150px
    const minTitleWidth = Math.max(titleLength * 12, 150);
    const durationWidth = item.duration * cellWidth;
    
    // Return the larger of the calculated width or the duration width
    return Math.max(minTitleWidth, durationWidth);
  };

  // Apply dnd-kit styles with minimum width calculation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${item.duration * cellWidth}px`,
    minWidth: `${calculateMinWidth()}px`, // Apply calculated min width
    zIndex: isDragging ? 100 : isSelected ? 10 : 1,
  };
  
  // Get category icon
  const getCategoryIcon = () => {
    const category = item.category || 'default';
    
    switch (category) {
      case 'milestone':
        return <Star size={16} className="text-white" />;
      case 'research':
        return <AlertTriangle size={16} className="text-white" />;
      case 'design':
        return <Package size={16} className="text-white" />;
      case 'development':
        return <Monitor size={16} className="text-white" />;
      case 'testing':
        return <Cpu size={16} className="text-white" />;
      default:
        return null;
    }
  };

  // FL Studio style gradient based on category
  const getCategoryGradient = () => {
    const category = item.category || 'default';
    
    switch (category) {
      case 'milestone':
        return "from-yellow-400 to-amber-500 border-yellow-300";
      case 'research':
        return "from-indigo-400 to-indigo-500 border-indigo-300";
      case 'design':
        return "from-sky-400 to-blue-500 border-sky-300";
      case 'development':
        return "from-emerald-400 to-emerald-500 border-emerald-300";
      case 'testing':
        return "from-orange-400 to-orange-500 border-orange-300";
      case 'marketing':
        return "from-purple-400 to-purple-500 border-purple-300";
      case 'feature':
        return "from-pink-400 to-pink-500 border-pink-300";
      case 'mobile':
        return "from-cyan-400 to-cyan-500 border-cyan-300";
      case 'web':
        return "from-emerald-400 to-green-500 border-emerald-300";
      case 'infrastructure':
        return "from-slate-400 to-slate-500 border-slate-300";
      case 'backend':
        return "from-teal-400 to-teal-500 border-teal-300";
      default:
        return "from-emerald-400 to-emerald-500 border-emerald-300";
    }
  };
  
  const cardGradient = getCategoryGradient();
  const categoryIcon = getCategoryIcon();
  
  // FL Studio-style resize handling
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setInitialDuration(item.duration);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  // FL Studio-like resize behavior with exact cell rounding
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    const deltaUnits = Math.round(deltaX / cellWidth);
    const newDuration = Math.max(1, initialDuration + deltaUnits);
    
    if (onResize) {
      onResize(item.id, newDuration);
    }
  };
  
  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "h-[120px] rounded-lg transition-all duration-300", 
        isDragging ? "opacity-80 z-50" : "opacity-100",
        "transform-gpu cursor-grab select-none",
      )}
      {...attributes}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "rounded-lg h-full px-4 py-3 transition-all duration-300 relative overflow-hidden border shadow-md", 
          isSelected
            ? `bg-gradient-to-r ${cardGradient} shadow-lg shadow-emerald/30 animate-emerald-pulse`
            : isHovered
              ? `bg-gradient-to-r ${cardGradient} shadow-sm shadow-emerald/20 opacity-95`
              : `bg-gradient-to-r ${cardGradient} opacity-90`
        )}
      >
        {/* FL Studio style drag handle - more prominent */}
        <div 
          className="absolute top-2 left-2 p-1 text-white/70 hover:text-white hover:bg-white/10 rounded opacity-70 hover:opacity-100 transition-all cursor-grab z-10"
          {...listeners}
        >
          <GripHorizontal size={14} />
        </div>
        
        {/* Category icon */}
        {categoryIcon && (
          <div className="absolute left-3 top-3">
            {categoryIcon}
          </div>
        )}
        
        {/* Edit button */}
        {onEdit && (isHovered || isSelected) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Edit goal"
          >
            <Edit2 size={14} />
          </button>
        )}
        
        {/* Content - Enhanced for better visibility */}
        <div className={cn(
          "flex flex-col h-full relative z-2 pt-4",
          categoryIcon ? "pl-7" : ""
        )}>
          <h3 className="font-medium text-base text-white line-clamp-2 drop-shadow-sm">{item.title}</h3>
          
          {/* Description with better contrast */}
          <div className="mt-2 space-y-1">
            {item.description && (
              <p className="text-sm text-white/90 line-clamp-3 drop-shadow-sm">{item.description}</p>
            )}
          </div>
          
          {/* Progress bar for items with longer duration */}
          {item.duration > 1 && (
            <div className="mt-auto select-none">
              <div className="h-2 bg-black/30 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-white/80 transition-all duration-700 ease-out"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* FL Studio-style resize handle - more visible */}
        {onResize && (
          <div 
            ref={resizeRef}
            className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize hover:bg-white/20 active:bg-white/30"
            onMouseDown={handleResizeStart}
            title="Drag to resize"
          >
            <div className="absolute right-1 top-0 bottom-0 w-[2px] bg-white/30"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineCard;
