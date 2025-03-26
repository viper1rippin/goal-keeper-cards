
import React, { useState, useRef } from "react";
import { SubGoalTimelineItem } from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface TimelineCardProps {
  item: SubGoalTimelineItem;
  onEdit?: () => void;
  onResize?: (itemId: string, newDuration: number) => void;
  cellWidth: number;
}

const TimelineCard = ({ item, onEdit, onResize, cellWidth }: TimelineCardProps) => {
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

  // Apply dnd-kit styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${item.duration * cellWidth}px`,
    zIndex: isDragging ? 100 : isHovered ? 10 : 1,
  };
  
  // Get category-based colors
  const getCategoryColors = () => {
    const category = item.category || 'default';
    
    switch (category) {
      case 'milestone':
        return 'bg-amber-500 border-amber-400';
      case 'feature':
        return 'bg-blue-500 border-blue-400';
      case 'research':
        return 'bg-purple-500 border-purple-400';
      case 'design':
        return 'bg-pink-500 border-pink-400';
      case 'development':
        return 'bg-emerald-500 border-emerald-400';
      case 'testing':
        return 'bg-orange-500 border-orange-400';
      case 'marketing':
        return 'bg-red-500 border-red-400';
      default:
        return 'bg-emerald-500 border-emerald-400';
    }
  };

  const colorClass = getCategoryColors();
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setInitialDuration(item.duration);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    const deltaUnits = Math.round(deltaX / cellWidth);
    const newDuration = Math.max(1, initialDuration + deltaUnits);
    
    if (onResize) {
      onResize(item.id, newDuration);
    }
  };
  
  // Handle resize end
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
        "h-[80px] rounded-lg transition-all duration-300",
        isDragging ? "opacity-80 z-50" : "opacity-100",
        "transform-gpu"
      )}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "rounded-lg h-full px-3 py-2 transition-all duration-300 relative overflow-hidden border",
          colorClass,
          isHovered ? "shadow-lg" : "shadow-md"
        )}
      >
        {/* Edit button */}
        {onEdit && isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-1 right-1 p-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Edit goal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          </button>
        )}
        
        {/* Content */}
        <div className="flex flex-col h-full relative z-2">
          <h3 className="font-medium text-sm text-white line-clamp-1">{item.title}</h3>
          
          {item.description && item.duration > 2 && (
            <p className="text-xs text-white/80 flex-1 mt-1 line-clamp-2">{item.description}</p>
          )}
          
          {/* Progress bar for items with longer duration */}
          {item.duration > 1 && (
            <div className="mt-auto select-none">
              <div className="h-1 bg-black/30 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-white/80 transition-all duration-700 ease-out"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Resize handle */}
        {onResize && (
          <div 
            ref={resizeRef}
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20"
            onMouseDown={handleResizeStart}
          />
        )}
      </div>
    </div>
  );
};

export default TimelineCard;
