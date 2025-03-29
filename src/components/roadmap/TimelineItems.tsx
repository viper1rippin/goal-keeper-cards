
import React from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from './types';
import TimelineItemsList from './TimelineItemsList';
import DraggingGhost from './DraggingGhost';

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
  // Get the dragging item for the ghost element
  const draggingItem = items.find(item => item.id === draggingItemId);

  return (
    <div className="absolute inset-0">
      <TimelineItemsList 
        items={items}
        selectedItem={selectedItem}
        cellWidth={cellWidth}
        viewMode={viewMode}
        isDragging={isDragging}
        draggingItemId={draggingItemId}
        onEditItem={onEditItem}
        onResizeItem={onResizeItem}
        onSelectItem={onSelectItem}
        onDragStart={onDragStart}
      />
      
      {/* Drag ghost element */}
      {isDragging && draggingItemId && (
        <DraggingGhost 
          draggingItem={draggingItem}
          ghostPosition={ghostPosition}
          cellWidth={cellWidth}
        />
      )}
    </div>
  );
};

export default TimelineItems;
