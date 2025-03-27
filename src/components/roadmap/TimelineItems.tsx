
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
      
      {/* Improved drag ghost element */}
      {isDragging && draggingItemId && (
        <div 
          className="absolute pointer-events-none"
          style={{
            top: `${ghostPosition.top}px`,
            left: `${ghostPosition.left}px`,
            width: `${(items.find(item => item.id === draggingItemId)?.duration || 1) * cellWidth}px`,
            zIndex: 999,
            transition: 'none', // Remove transition for immediate response
          }}
        >
          <div className="h-[80px] rounded-lg bg-emerald-500/80 border-2 border-white/80 shadow-lg shadow-black/30">
            <div className="p-2 text-white truncate">
              {items.find(item => item.id === draggingItemId)?.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineItems;
