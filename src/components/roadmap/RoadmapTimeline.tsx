
import React, { useState, useRef, useEffect } from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from './types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SubGoalTimelineForm from './SubGoalTimelineForm';
import TimelineCard from './TimelineCard';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragMoveEvent,
  KeyboardSensor,
  pointerWithin,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';

interface RoadmapTimelineProps {
  roadmapId: string;
  items: SubGoalTimelineItem[];
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
  onDeleteItem?: (itemId: string) => void;
  viewMode: TimelineViewMode;
}

const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ 
  roadmapId, 
  items, 
  onItemsChange, 
  onDeleteItem,
  viewMode 
}) => {
  const [months] = useState([
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]);
  const [quarters] = useState(['Q1', 'Q2', 'Q3', 'Q4']);
  
  const [selectedItem, setSelectedItem] = useState<SubGoalTimelineItem | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [maxRow, setMaxRow] = useState(3);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(100);
  
  // Get time units based on view mode
  const getTimeUnits = () => {
    switch (viewMode) {
      case 'month':
        return months;
      case 'year':
        return quarters;
      default:
        return months;
    }
  };
  
  const timeUnits = getTimeUnits();
  const timeUnitCount = timeUnits.length;
  
  // Calculate cell width based on container size and view mode
  useEffect(() => {
    if (timelineRef.current) {
      const containerWidth = timelineRef.current.clientWidth;
      // Leave some margin for scrollbar and padding
      const calculatedWidth = (containerWidth - 60) / timeUnitCount;
      setCellWidth(Math.max(calculatedWidth, 80)); // Minimum 80px per cell
    }
  }, [timelineRef.current?.clientWidth, viewMode, timeUnitCount]);
  
  // Add sensors for drag operations
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {})
  );
  
  // Calculate the maximum row value to determine the height
  useEffect(() => {
    if (items.length === 0) return;
    
    const maxRowValue = Math.max(...items.map(item => item.row));
    setMaxRow(Math.max(maxRowValue + 1, 3)); // Ensure at least 3 rows
  }, [items]);
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggingItemId(active.id as string);
  };
  
  // Handle drag move
  const handleDragMove = (event: DragMoveEvent) => {
    // Currently empty, but needed for future features
  };
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDraggingItemId(null);
      return;
    }
    
    // Find the dragged item
    const draggedItem = items.find(item => item.id === active.id);
    if (!draggedItem) {
      setDraggingItemId(null);
      return;
    }
    
    // Calculate new position
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      
      // Safely access clientX and clientY
      const clientX = event.activatorEvent instanceof MouseEvent 
        ? event.activatorEvent.clientX 
        : event.activatorEvent instanceof TouchEvent 
          ? event.activatorEvent.touches[0].clientX 
          : 0;
          
      const clientY = event.activatorEvent instanceof MouseEvent 
        ? event.activatorEvent.clientY 
        : event.activatorEvent instanceof TouchEvent 
          ? event.activatorEvent.touches[0].clientY 
          : 0;
      
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;
      
      // Calculate new position
      const newCell = Math.max(0, Math.min(timeUnitCount - 1, Math.floor(relativeX / cellWidth)));
      const newRow = Math.max(0, Math.min(maxRow - 1, Math.floor(relativeY / 100)));
      
      // Update the item's position
      const updatedItems = items.map(item => {
        if (item.id === draggedItem.id) {
          return {
            ...item,
            start: newCell,
            row: newRow
          };
        }
        return item;
      });
      
      onItemsChange(updatedItems);
    }
    
    setDraggingItemId(null);
  };
  
  // Handle resizing an item
  const handleResizeItem = (itemId: string, newDuration: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          duration: newDuration
        };
      }
      return item;
    });
    
    onItemsChange(updatedItems);
  };
  
  // Open item form for editing
  const handleEditItem = (item: SubGoalTimelineItem) => {
    setSelectedItem(item);
    setOpenForm(true);
  };
  
  // Open form for new item
  const handleAddItem = () => {
    const newItem: SubGoalTimelineItem = {
      id: `item-${Date.now()}`,
      title: 'New Item',
      description: '',
      progress: 0,
      row: 0,
      start: 0,
      duration: 2,
      category: 'default',
      parentId: roadmapId
    };
    
    setSelectedItem(newItem);
    setOpenForm(true);
  };
  
  // Save item changes
  const handleSaveItem = (item: SubGoalTimelineItem) => {
    const isEditing = items.some(i => i.id === item.id);
    
    const updatedItems = isEditing
      ? items.map(i => (i.id === item.id ? item : i))
      : [...items, item];
    
    onItemsChange(updatedItems);
    setOpenForm(false);
    setSelectedItem(null);
  };
  
  // Delete an item
  const handleDeleteItem = (itemId: string) => {
    // Call the parent component's delete handler if provided
    if (onDeleteItem) {
      onDeleteItem(itemId);
    } else {
      // Fallback to local state update if no handler provided
      const updatedItems = items.filter(item => item.id !== itemId);
      onItemsChange(updatedItems);
    }
    
    setOpenForm(false);
    setSelectedItem(null);
  };
  
  // Render timeline with months and items
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 backdrop-blur-sm overflow-hidden shadow-xl">
      {/* Timeline header with time units */}
      <div className="border-b border-slate-800 p-2 bg-slate-800/50">
        <div className="flex">
          {timeUnits.map((unit, idx) => (
            <div 
              key={unit.toString()}
              className="text-center text-sm font-medium text-slate-300"
              style={{ minWidth: `${cellWidth}px`, flexGrow: 1 }}
            >
              {unit}
            </div>
          ))}
        </div>
      </div>
      
      {/* Timeline body */}
      <div 
        className="relative overflow-x-auto"
        style={{ height: `${maxRow * 100 + 50}px` }}
        ref={timelineRef}
      >
        {/* Time unit dividers */}
        <div className="absolute inset-0 flex pointer-events-none">
          {timeUnits.map((_, idx) => (
            <div 
              key={idx}
              className="h-full border-r border-slate-800/70"
              style={{ width: `${cellWidth}px` }}
            ></div>
          ))}
        </div>
        
        {/* Row dividers */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: maxRow }).map((_, idx) => (
            <div 
              key={idx}
              className="w-full border-b border-slate-800/70"
              style={{ height: '100px' }}
            ></div>
          ))}
        </div>
        
        {/* Drag and drop context */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          collisionDetection={pointerWithin}
          modifiers={[restrictToParentElement]}
        >
          {/* Timeline items */}
          <div className="absolute inset-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="absolute"
                style={{ 
                  top: `${item.row * 100 + 10}px`,
                  left: `${item.start * cellWidth}px`,
                }}
              >
                <TimelineCard
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  onSelect={() => setSelectedItem(item)}
                  onEdit={() => handleEditItem(item)}
                  onResize={handleResizeItem}
                  cellWidth={cellWidth}
                  viewMode={viewMode}
                />
              </div>
            ))}
            
            {/* Add button at the bottom */}
            <button
              onClick={handleAddItem}
              className="absolute bottom-4 right-4 bg-emerald hover:bg-emerald-600 text-white rounded-full p-2 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </button>
          </div>
          
          {/* Drag overlay */}
          <DragOverlay>
            {draggingItemId ? (
              <div className="opacity-80">
                {items.map((item) => {
                  if (item.id === draggingItemId) {
                    return (
                      <TimelineCard
                        key={`overlay-${item.id}`}
                        item={item}
                        isSelected={true}
                        onSelect={() => {}}
                        cellWidth={cellWidth}
                        viewMode={viewMode}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      
      {/* Item edit dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedItem && (
            <SubGoalTimelineForm
              item={selectedItem}
              onSave={handleSaveItem}
              onDelete={handleDeleteItem}
              onCancel={() => setOpenForm(false)}
              viewMode={viewMode}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoadmapTimeline;
