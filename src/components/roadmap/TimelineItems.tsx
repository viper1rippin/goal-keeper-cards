
import React from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from './types';
import TimelineCard from './TimelineCard';

interface TimelineItemsProps {
  items: SubGoalTimelineItem[];
  selectedItem: SubGoalTimelineItem | null;
  cellWidth: number;
  viewMode: TimelineViewMode;
  isDragging: boolean;
  draggingItemId: string | null;
  ghostPosition: { left: number; top: number };
  onEditItem: (item: SubGoalTimelineItem) => void;
  onResizeItem: (itemId: string, newDuration: number) => void;
  onSelectItem: (item: SubGoalTimelineItem) => void;
  onDragStart: (e: React.MouseEvent, itemId: string) => void;
}

const TimelineItems: React.FC<TimelineItemsProps> = ({
  items,
  selectedItem,
  cellWidth,
  viewMode,
  isDragging,
  draggingItemId,
  ghostPosition,
  onEditItem,
  onResizeItem,
  onSelectItem,
  onDragStart
}) => {
  // Find the dragged item data
  const draggedItem = isDragging && draggingItemId 
    ? items.find(item => item.id === draggingItemId) 
    : null;

  return (
    <div className="absolute inset-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute"
          style={{ 
            top: `${item.row * 100 + 10}px`,
            left: `${item.start * cellWidth}px`,
            opacity: isDragging && draggingItemId === item.id ? 0.4 : 1,
            transition: isDragging ? 'none' : 'opacity 0.2s ease-out',
          }}
        >
          <TimelineCard
            item={item}
            isSelected={selectedItem?.id === item.id}
            onSelect={() => onSelectItem(item)}
            onEdit={() => onEditItem(item)}
            onResize={onResizeItem}
            cellWidth={cellWidth}
            viewMode={viewMode}
            onDragStart={onDragStart}
          />
        </div>
      ))}
      
      {/* Drag ghost element with more fluid visuals */}
      {isDragging && draggingItemId && draggedItem && (
        <div 
          className="absolute pointer-events-none transform-gpu z-50"
          style={{
            top: `${ghostPosition.top}px`,
            left: `${ghostPosition.left}px`,
            width: `${draggedItem.duration * cellWidth}px`,
            transition: 'none',
            opacity: 0.9,
          }}
        >
          <div className="h-[80px] rounded-lg bg-emerald-500/90 border-2 border-white/90 shadow-xl shadow-black/40">
            <div className="p-2 text-white truncate font-medium">
              {draggedItem.title}
            </div>
            {draggedItem.description && (
              <div className="px-2 pb-2 text-white/80 text-xs truncate">
                {draggedItem.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineItems;
