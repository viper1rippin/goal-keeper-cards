
import React from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from './types';
import { Edit2, GripHorizontal } from 'lucide-react';

interface TimelineCardContentProps {
  item: SubGoalTimelineItem;
  isHovered: boolean;
  isSelected: boolean;
  isResizing: boolean;
  tempDuration: number;
  viewMode: TimelineViewMode;
  onEdit?: () => void;
  onDragStart?: (e: React.MouseEvent, itemId: string) => void;
}

const TimelineCardContent: React.FC<TimelineCardContentProps> = ({
  item,
  isHovered,
  isSelected,
  isResizing,
  tempDuration,
  viewMode,
  onEdit,
  onDragStart
}) => {
  const shouldShowExpandedDetails = isSelected || isHovered || item.duration > 3;
  
  const getDurationLabel = () => {
    if (viewMode === 'month') {
      return `${tempDuration} ${tempDuration === 1 ? 'day' : 'days'}`;
    } else if (viewMode === 'year') {
      return `${tempDuration} ${tempDuration === 1 ? 'month' : 'months'}`;
    }
    return `${tempDuration}`;
  };
  
  const handleDragHandleMouseDown = (e: React.MouseEvent) => {
    if (onDragStart) {
      e.preventDefault();
      e.stopPropagation();
      onDragStart(e, item.id);
    }
  };
  
  return (
    <>
      <div 
        className="absolute top-1 left-1 p-1 text-white/70 hover:text-white hover:bg-white/10 rounded opacity-70 hover:opacity-100 transition-all cursor-grab z-10"
        onMouseDown={handleDragHandleMouseDown}
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
            
            {isResizing && (
              <p className="text-xs font-semibold text-white/90 mt-1 bg-black/20 px-1.5 py-0.5 rounded inline-block">
                {getDurationLabel()}
              </p>
            )}
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
      
      {isResizing && (
        <div className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none z-20"></div>
      )}
    </>
  );
};

export default TimelineCardContent;
