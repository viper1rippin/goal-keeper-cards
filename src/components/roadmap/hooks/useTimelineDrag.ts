import { useState, useEffect, useRef } from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from '../types';
import { calculateCellFromPosition, calculateRowFromPosition, updateDatesFromTimelinePosition } from '../utils/timelineUtils';

interface UseTimelineDragProps {
  items: SubGoalTimelineItem[];
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
  timeUnitCount: number;
  cellWidth: number;
  maxRow: number;
  currentYear: number;
  currentMonth: number;
  viewMode: TimelineViewMode;
}

interface TimelineDragState {
  isDragging: boolean;
  draggingItemId: string | null;
  dragStartX: number;
  dragStartY: number;
  dragInitialPosition: { row: number; start: number };
  dragOffset: { x: number; y: number };
  ghostPosition: { left: number; top: number };
}

export const useTimelineDrag = ({
  items,
  onItemsChange,
  timeUnitCount,
  cellWidth,
  maxRow,
  currentYear,
  currentMonth,
  viewMode
}: UseTimelineDragProps) => {
  const [dragState, setDragState] = useState<TimelineDragState>({
    isDragging: false,
    draggingItemId: null,
    dragStartX: 0,
    dragStartY: 0,
    dragInitialPosition: { row: 0, start: 0 },
    dragOffset: { x: 0, y: 0 },
    ghostPosition: { left: 0, top: 0 }
  });
  
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const handleDragStart = (e: React.MouseEvent, itemId: string) => {
    // Get the item
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    // Get the initial position of the timeline container
    const timelineRect = timelineRef.current?.getBoundingClientRect();
    if (!timelineRect) return;
    
    setDragState({
      isDragging: true,
      draggingItemId: itemId,
      dragStartX: e.clientX,
      dragStartY: e.clientY,
      dragInitialPosition: { row: item.row, start: item.start },
      dragOffset: {
        x: e.clientX - (timelineRect.left + item.start * cellWidth),
        y: e.clientY - (timelineRect.top + item.row * 100 + 10)
      },
      ghostPosition: {
        left: (item.start * cellWidth), 
        top: (item.row * 100 + 10)
      }
    });
    
    // Add document event listeners with immediate activation
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // Set cursor style for better feedback
    document.body.style.cursor = 'grabbing';
    
    // Prevent default behavior
    e.preventDefault();
  };
  
  const handleDragMove = (e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggingItemId || !timelineRef.current) return;
    
    const timelineRect = timelineRef.current.getBoundingClientRect();
    
    // Calculate position relative to timeline with no threshold
    const relativeX = e.clientX - timelineRect.left - dragState.dragOffset.x;
    const relativeY = e.clientY - timelineRect.top - dragState.dragOffset.y;
    
    // Update ghost position for visual feedback immediately
    setDragState(prev => ({
      ...prev,
      ghostPosition: {
        left: relativeX,
        top: relativeY
      }
    }));
  };
  
  const handleDragEnd = (e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggingItemId || !timelineRef.current) {
      cleanup();
      return;
    }
    
    const timelineRect = timelineRef.current.getBoundingClientRect();
    
    // Get the dragged item
    const draggedItem = items.find(item => item.id === dragState.draggingItemId);
    if (!draggedItem) {
      cleanup();
      return;
    }
    
    // Calculate position relative to timeline
    const relativeX = e.clientX - timelineRect.left;
    const relativeY = e.clientY - timelineRect.top;
    
    // Calculate new cell and row positions
    const newCell = calculateCellFromPosition(relativeX, cellWidth, timeUnitCount);
    const newRow = calculateRowFromPosition(relativeY, 100, maxRow);
    
    // Update dates based on new position
    const { startDate, endDate } = updateDatesFromTimelinePosition(
      newCell,
      draggedItem.duration,
      currentYear,
      currentMonth,
      viewMode
    );
    
    // Create updated items array
    const updatedItems = items.map(item => {
      if (item.id === dragState.draggingItemId) {
        return {
          ...item,
          start: newCell,
          row: newRow,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };
      }
      return item;
    });
    
    // Update state
    onItemsChange(updatedItems);
    cleanup();
  };
  
  const cleanup = () => {
    // Reset cursor style
    document.body.style.cursor = '';
    
    setDragState({
      isDragging: false,
      draggingItemId: null,
      dragStartX: 0,
      dragStartY: 0,
      dragInitialPosition: { row: 0, start: 0 },
      dragOffset: { x: 0, y: 0 },
      ghostPosition: { left: 0, top: 0 }
    });
    
    // Remove document event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };
  
  // Cleanup effect for unmounting
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = '';
    };
  }, []);
  
  return {
    timelineRef,
    ...dragState,
    handleDragStart
  };
};
