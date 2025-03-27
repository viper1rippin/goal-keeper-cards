
import React, { useState, useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScrollActive, setAutoScrollActive] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'left' | 'right' | null>(null);
  const scrollSpeed = 15; // Pixels per scroll frame
  const scrollThreshold = 100; // Distance from edge to trigger auto-scroll

  // Auto-scroll functionality when dragging near edges
  useEffect(() => {
    if (!isDragging || !containerRef.current || !scrollDirection) {
      return;
    }

    const container = containerRef.current;
    const parentElement = container.parentElement;
    
    if (!parentElement) return;

    const scrollInterval = setInterval(() => {
      if (scrollDirection === 'right') {
        parentElement.scrollLeft += scrollSpeed;
      } else if (scrollDirection === 'left') {
        parentElement.scrollLeft -= scrollSpeed;
      }
    }, 16); // ~60fps

    return () => clearInterval(scrollInterval);
  }, [isDragging, scrollDirection]);

  // Update scroll direction based on mouse position
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const parentElement = container.parentElement;
    
    if (!parentElement) return;

    const rect = parentElement.getBoundingClientRect();
    const distanceFromLeft = e.clientX - rect.left;
    const distanceFromRight = rect.right - e.clientX;

    if (distanceFromRight < scrollThreshold) {
      setScrollDirection('right');
      setAutoScrollActive(true);
    } else if (distanceFromLeft < scrollThreshold) {
      setScrollDirection('left');
      setAutoScrollActive(true);
    } else {
      setScrollDirection(null);
      setAutoScrollActive(false);
    }
  };

  const handleMouseLeave = () => {
    setAutoScrollActive(false);
    setScrollDirection(null);
  };

  // Calculate styles for drag ghost
  const getGhostStyles = () => {
    if (!isDragging || !draggingItemId) return {};
    
    const draggingItem = items.find(item => item.id === draggingItemId);
    if (!draggingItem) return {};
    
    return {
      width: `${draggingItem.duration * cellWidth}px`,
      opacity: 0.8,
      transform: 'scale(1.02)',
      zIndex: 999,
    };
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
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
      
      {/* Drag ghost element with enhanced styles */}
      {isDragging && draggingItemId && (
        <div 
          className="absolute pointer-events-none"
          style={{
            top: `${ghostPosition.top}px`,
            left: `${ghostPosition.left}px`,
            ...getGhostStyles(),
          }}
        >
          <div className="h-[80px] rounded-lg bg-emerald-500/80 border-2 border-white/80 shadow-lg shadow-black/50">
            <div className="p-2 text-white truncate font-medium">
              {items.find(item => item.id === draggingItemId)?.title}
            </div>
            {autoScrollActive && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl">
                {scrollDirection === 'right' ? '→' : '←'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineItems;
