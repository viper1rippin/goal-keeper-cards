
import React, { useState, useRef, useEffect } from "react";
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
  const [currentDuration, setCurrentDuration] = useState(item.duration);
  
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

  // Apply dnd-kit styles with width based on duration and cell width
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing ? 'none' : transition,
    width: `${currentDuration * cellWidth}px`,
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
  
  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    const deltaUnits = Math.round(deltaX / cellWidth);
    
    // Calculate new duration with a minimum of 1 cell
    const maxDuration = viewMode === 'month' ? 31 : 12;
    const newDuration = Math.max(1, Math.min(maxDuration, initialDuration + deltaUnits));
    
    // Update local state for visual feedback
    setCurrentDuration(newDuration);
  };
  
  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false);
    
    // Call parent callback if duration changed
    if (onResize && currentDuration !== item.duration) {
      onResize(item.id, currentDuration);
    }
    
    // Remove document event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg transition-all", 
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
          "rounded-lg px-4 py-3 transition-all relative overflow-visible border shadow-md", 
          isSelected
            ? `bg-gradient-to-r ${cardGradient} shadow-lg shadow-emerald/30`
            : isHovered
              ? `bg-gradient-to-r ${cardGradient} shadow-sm shadow-emerald/20 opacity-95`
              : `bg-gradient-to-r ${cardGradient} opacity-90`,
          isResizing ? "resize-cursor" : ""
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
        
        {/* Content */}
        <div className={cn(
          "flex flex-col relative z-2 pt-4",
          categoryIcon ? "pl-7" : ""
        )}>
          <h3 className="font-medium text-base text-white line-clamp-2 drop-shadow-sm">{item.title}</h3>
          
          {item.description && (
            <p className="mt-2 text-sm text-white/90 break-words line-clamp-3 drop-shadow-sm">{item.description}</p>
          )}
          
          {/* Progress bar for items with longer duration */}
          {currentDuration > 1 && (
            <div className="mt-3 select-none">
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/80 transition-all duration-700 ease-out"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Right edge for resizing - using the entire right edge of the card */}
        {onResize && (
          <div 
            className="absolute top-0 right-0 w-6 h-full cursor-ew-resize hover:bg-white/20 transition-colors"
            onMouseDown={handleResizeStart}
            aria-label="Resize card"
          />
        )}
      </div>
    </div>
  );
};

export default TimelineCard;
