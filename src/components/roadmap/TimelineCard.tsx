
import React, { useState } from "react";
import { SubGoalTimelineItem, TimelineViewMode } from "./types";
import { cn } from "@/lib/utils";
import { useResizeTimeline } from "./hooks/useResizeTimeline";
import TimelineCardContent from "./TimelineCardContent";
import TimelineCardResizeHandle from "./TimelineCardResizeHandle";

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
  
  const {
    isResizing,
    currentWidth,
    tempDuration,
    cardRef,
    resizeRef,
    handleResizeStart
  } = useResizeTimeline({
    initialDuration: item.duration,
    cellWidth,
    onResize,
    itemId: item.id
  });
  
  const style = {
    width: currentWidth,
    zIndex: isResizing ? 50 : isSelected ? 10 : 1,
  };
  
  const colorClass = 'from-emerald-400 to-emerald-500 border-emerald-300';
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2 && onDragStart) {
      e.preventDefault();
      e.stopPropagation();
      onDragStart(e, item.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
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
        <TimelineCardContent
          item={item}
          isHovered={isHovered}
          isSelected={isSelected}
          isResizing={isResizing}
          tempDuration={tempDuration}
          viewMode={viewMode}
          onEdit={onEdit}
        />
        
        {onResize && (
          <TimelineCardResizeHandle
            resizeRef={resizeRef}
            handleResizeStart={handleResizeStart}
          />
        )}
      </div>
    </div>
  );
};

export default TimelineCard;
