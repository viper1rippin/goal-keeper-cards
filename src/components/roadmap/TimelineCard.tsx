
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
  const [currentWidth, setCurrentWidth] = useState(item.duration * cellWidth);
  
  const resizeRef = useRef<HTMLDivElement>(null);
  
  // Setup sortable hook
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

  // Calculate minimum width based on text length to ensure title visibility
  const calculateMinWidth = () => {
    const titleLength = item.title?.length || 0;
    // Ensure at least 15px per character with a minimum of 180px
    const minTitleWidth = Math.max(titleLength * 15, 180);
    
    // Return the larger of the calculated width or the minimum cell width
    return Math.max(minTitleWidth, cellWidth);
  };

  // Update current width when duration or cell width changes
  useEffect(() => {
    setCurrentWidth(item.duration * cellWidth);
  }, [item.duration, cellWidth]);

  // Apply dnd-kit styles with minimum width calculation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing ? 'none' : transition,
    width: `${currentWidth}px`,
    minWidth: `${calculateMinWidth()}px`,
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

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setInitialDuration(item.duration);
    
    // Add event listeners to window to capture mouse movements outside the element
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  };
  
  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    const deltaUnits = Math.round(deltaX / cellWidth);
    const newDuration = Math.max(1, initialDuration + deltaUnits);
    
    // Update visual width immediately for smooth resizing
    setCurrentWidth(newDuration * cellWidth);
    
    // Call the parent's resize handler
    if (onResize) {
      onResize(item.id, newDuration);
    }
  };
  
  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false);
    
    // Remove event listeners from window
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
  };

  // Use a uniform emerald gradient like the home page sub-goal cards
  const cardGradient = "from-emerald-400 to-emerald-500 border-emerald-300";
  const categoryIcon = getCategoryIcon();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "h-[120px] rounded-lg transition-all", 
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
          
          {/* Always display description with better contrast */}
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
        
        {/* Resize handle - Improved for better visibility and interaction */}
        {onResize && (
          <div 
            ref={resizeRef}
            className={cn(
              "absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize",
              isResizing ? "bg-white/40" : isHovered ? "bg-white/20" : "bg-white/10",
              "transition-colors"
            )}
            onMouseDown={handleResizeStart}
            title="Drag to resize"
          >
            <div className={cn(
              "absolute inset-y-0 right-1.5 w-1 rounded-full my-2",
              isResizing ? "bg-white/80" : "bg-white/40"
            )}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineCard;
