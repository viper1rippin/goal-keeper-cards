
import React, { useState, useRef, useEffect } from "react";
import { SubGoalTimelineItem, TimelineViewMode } from "./types";
import { cn } from "@/lib/utils";
import { Edit2, GripHorizontal } from "lucide-react";

interface TimelineCardProps {
  item: SubGoalTimelineItem;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onResize?: (itemId: string, newDuration: number) => void;
  cellWidth: number;
  viewMode: TimelineViewMode;
  onDragStart?: (e: React.MouseEvent, itemId: string) => void;
}

const TimelineCard = ({ 
  item, 
  isSelected, 
  onSelect, 
  onEdit,
  onResize,
  cellWidth,
  viewMode,
  onDragStart
}: TimelineCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [initialDuration, setInitialDuration] = useState(item.duration);
  const [currentWidth, setCurrentWidth] = useState(`${item.duration * cellWidth}px`);
  const [tempDuration, setTempDuration] = useState(item.duration);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  
  // Update width when duration or cellWidth changes
  useEffect(() => {
    if (!isResizing) {
      setCurrentWidth(`${item.duration * cellWidth}px`);
      setTempDuration(item.duration);
    }
  }, [item.duration, cellWidth, isResizing]);
  
  const style = {
    width: currentWidth,
    zIndex: isResizing ? 50 : isSelected ? 10 : 1,
  };
  
  // Default colors for all cards
  const colorClass = 'from-emerald-400 to-emerald-500 border-emerald-300';
  
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setInitialDuration(tempDuration);
    
    // Add event listeners to the document
    document.addEventListener('mousemove', handleResizeMove, { capture: true });
    document.addEventListener('mouseup', handleResizeEnd, { capture: true });
    
    // Add visual feedback class to show that resizing is in progress
    if (cardRef.current) {
      cardRef.current.classList.add('resizing');
    }
  };
  
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    
    // Calculate exact pixel width for smooth visual feedback
    const exactPixelWidth = (initialDuration * cellWidth) + deltaX;
    const minWidth = cellWidth; // Minimum width of one cell
    
    // Apply the visual width change immediately for fluid resizing
    const fluidWidth = Math.max(minWidth, exactPixelWidth);
    setCurrentWidth(`${fluidWidth}px`);
    
    // Calculate duration for state updates (can be decimal)
    const newDurationExact = fluidWidth / cellWidth;
    
    // For events/state updates, we still want whole number cell increments
    const newDurationWhole = Math.max(1, Math.round(newDurationExact));
    
    // Only update the temp duration value when it changes to an integer
    if (tempDuration !== newDurationWhole) {
      setTempDuration(newDurationWhole);
      
      // Removing immediate feedback during resize
      // onResize call removed from here
    }
  };
  
  const handleResizeEnd = () => {
    if (!isResizing) return;
    
    setIsResizing(false);
    
    // Final update only when resizing ends
    if (onResize) {
      onResize(item.id, tempDuration);
    }
    
    // Clean up event listeners
    document.removeEventListener('mousemove', handleResizeMove, { capture: true });
    document.removeEventListener('mouseup', handleResizeEnd, { capture: true });
    
    // Remove visual feedback class
    if (cardRef.current) {
      cardRef.current.classList.remove('resizing');
    }
  };

  const shouldShowExpandedDetails = isSelected || isHovered || item.duration > 3;

  // Get label for duration based on view mode
  const getDurationLabel = () => {
    if (viewMode === 'month') {
      return `${tempDuration} ${tempDuration === 1 ? 'day' : 'days'}`;
    } else if (viewMode === 'year') {
      return `${tempDuration} ${tempDuration === 1 ? 'month' : 'months'}`;
    }
    return `${tempDuration}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2 && onDragStart) { // Right mouse button
      e.preventDefault();
      e.stopPropagation();
      onDragStart(e, item.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default context menu
  };

  return (
    <div
      ref={cardRef}
      style={style}
      className={cn(
        "h-[80px] rounded-lg transition-all",
        isResizing ? "cursor-ew-resize" : "cursor-grab",
        "transform-gpu select-none",
      )}
      onClick={(e) => {
        if (!isResizing) onSelect();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      <div 
        className={cn(
          "rounded-lg h-full px-3 py-2 transition-all relative overflow-hidden border shadow-md",
          isResizing
            ? `bg-gradient-to-r ${colorClass} shadow-lg shadow-black/50 border-2 border-white/40`
            : isSelected
              ? `bg-gradient-to-r ${colorClass} shadow-lg shadow-black/30`
              : isHovered
                ? `bg-gradient-to-r ${colorClass} shadow-sm shadow-black/20 opacity-95`
                : `bg-gradient-to-r ${colorClass} opacity-90`
        )}
      >
        <div 
          className="absolute top-1 left-1 p-1 text-white/70 hover:text-white hover:bg-white/10 rounded opacity-70 hover:opacity-100 transition-all cursor-grab z-10"
        >
          <GripHorizontal size={12} />
        </div>
        
        {onEdit && (isHovered || isSelected) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-1 right-1 p-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Edit goal"
          >
            <Edit2 size={12} />
          </button>
        )}
        
        <div className="flex flex-col h-full relative z-2 pt-3">
          <h3 className="font-medium text-sm text-white line-clamp-1">{item.title}</h3>
          
          {shouldShowExpandedDetails && (
            <div className="mt-1 space-y-0.5">
              {item.description && (
                <p className="text-xs text-white/80 line-clamp-2">{item.description}</p>
              )}
              
              {/* Removing the immediate feedback notification that shows duration while resizing */}
            </div>
          )}
          
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
        
        {onResize && (
          <div 
            ref={resizeRef}
            className={cn(
              "absolute right-0 top-0 bottom-0 w-12 cursor-ew-resize hover:bg-white/20",
              "after:content-[''] after:absolute after:right-0 after:h-full after:w-3 after:bg-white/40 after:opacity-30 hover:after:opacity-100",
              isResizing && "after:opacity-100 bg-white/10"
            )}
            onMouseDown={handleResizeStart}
            onTouchStart={(e) => {
              e.preventDefault();
              handleResizeStart(e as unknown as React.MouseEvent);
            }}
          />
        )}
        
        {isResizing && (
          <div className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none z-20"></div>
        )}
      </div>
    </div>
  );
};

export default TimelineCard;
