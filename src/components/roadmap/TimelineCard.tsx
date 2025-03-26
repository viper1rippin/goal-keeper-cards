
import React, { useState, useRef, useEffect } from "react";
import { SubGoalTimelineItem, TimelineViewMode } from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Edit2, GripHorizontal, AlertTriangle, Star, Package, Monitor, Cpu, ArrowRightLeft } from "lucide-react";

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
  const [currentDuration, setCurrentDuration] = useState(item.duration);
  
  const resizeRef = useRef<HTMLDivElement>(null);
  
  // Setup sortable hook with resize-disable condition
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    disabled: isResizing
  });

  useEffect(() => {
    // Update current duration when the item's duration changes from parent
    setCurrentDuration(item.duration);
    setInitialDuration(item.duration);
  }, [item.duration]);

  // Calculate minimum width based on text length to ensure title visibility
  const calculateMinWidth = () => {
    const titleLength = item.title?.length || 0;
    // Ensure at least 10px per character with a minimum of 150px
    const minTitleWidth = Math.max(titleLength * 12, 150);
    const durationWidth = currentDuration * cellWidth;
    
    // Return the larger of the calculated width or the duration width
    return Math.max(minTitleWidth, durationWidth);
  };

  // Apply dnd-kit styles with minimum width calculation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${currentDuration * cellWidth}px`,
    minWidth: `${calculateMinWidth()}px`, // Apply calculated min width
    zIndex: isDragging ? 100 : isResizing ? 50 : isSelected ? 10 : 1,
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

  // Use a uniform emerald gradient like the home page sub-goal cards
  const cardGradient = "from-emerald-400 to-emerald-500 border-emerald-300";
  const categoryIcon = getCategoryIcon();
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setInitialDuration(currentDuration);
    
    // Add document event listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  // Handle resize move - enhanced to snap to grid
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    
    // Calculate how many cells to adjust by, rounding to nearest grid cell
    const deltaUnits = Math.round(deltaX / cellWidth);
    
    // Calculate new duration with a minimum of 1 cell
    let newDuration = Math.max(1, initialDuration + deltaUnits);
    
    // For month view, max out at 31 (days in a month)
    // For year view, max out at 12 (months in a year)
    const maxDuration = viewMode === 'month' ? 31 : 12;
    
    // Cap the maximum duration based on view mode
    if (newDuration > maxDuration) {
      newDuration = maxDuration;
    }
    
    // Update local state for smoother UI feedback
    setCurrentDuration(newDuration);
  };
  
  // Handle resize end
  const handleResizeEnd = () => {
    if (isResizing && onResize && currentDuration !== item.duration) {
      // Only call parent callback if duration actually changed
      onResize(item.id, currentDuration);
    }
    
    setIsResizing(false);
    
    // Remove document event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Add a tooltip to show duration information based on view mode
  const getDurationTooltip = () => {
    if (viewMode === 'month') {
      return `${currentDuration} day${currentDuration > 1 ? 's' : ''}`;
    } else {
      return `${currentDuration} month${currentDuration > 1 ? 's' : ''}`;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "h-[120px] rounded-lg transition-all", 
        isDragging ? "opacity-80 z-50" : "opacity-100",
        isResizing ? "cursor-ew-resize" : "transform-gpu cursor-grab",
        "select-none"
      )}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "rounded-lg h-full px-4 py-3 transition-all relative overflow-hidden border shadow-md", 
          isSelected
            ? `bg-gradient-to-r ${cardGradient} shadow-lg shadow-emerald/30 animate-emerald-pulse`
            : isHovered
              ? `bg-gradient-to-r ${cardGradient} shadow-sm shadow-emerald/20 opacity-95`
              : `bg-gradient-to-r ${cardGradient} opacity-90`
        )}
      >
        {/* Drag handle */}
        <div 
          className={cn(
            "absolute top-2 left-2 p-1 text-white/70 hover:text-white hover:bg-white/10 rounded opacity-70 hover:opacity-100 transition-all z-10",
            isResizing ? "cursor-ew-resize" : "cursor-grab"
          )}
          {...(isResizing ? {} : listeners)}
          {...attributes}
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
        {onEdit && (isHovered || isSelected) && !isResizing && (
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
          
          {/* Always display description with better contrast */}
          <div className="mt-2 space-y-1">
            {item.description && (
              <p className="text-sm text-white/90 line-clamp-3 drop-shadow-sm">{item.description}</p>
            )}
          </div>
          
          {/* Display duration badge */}
          {isHovered && (
            <div className="absolute bottom-2 right-2 bg-black/30 text-white/90 text-xs px-2 py-1 rounded-full">
              {getDurationTooltip()}
            </div>
          )}
          
          {/* Progress bar for items with longer duration */}
          {currentDuration > 1 && (
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
        
        {/* Resize handle with improved visibility */}
        {onResize && (
          <div 
            ref={resizeRef}
            className={cn(
              "absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize hover:bg-white/30 transition-all",
              isResizing ? "bg-white/40" : "bg-white/10"
            )}
            onMouseDown={handleResizeStart}
            title="Drag to resize"
            aria-label="Resize card"
          >
            {/* Visual indicator for resize handle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-1 bg-white/60 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineCard;
