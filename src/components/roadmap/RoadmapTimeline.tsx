
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
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';
import { getDaysInMonth } from 'date-fns';
import { calculateEndDateFromDurationChange } from './utils/timelineUtils';

interface RoadmapTimelineProps {
  roadmapId: string;
  items: SubGoalTimelineItem[];
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
  viewMode: TimelineViewMode;
}

const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ roadmapId, items, onItemsChange, viewMode }) => {
  const [months] = useState([
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]);
  const [quarters] = useState(['Q1', 'Q2', 'Q3', 'Q4']);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [selectedItem, setSelectedItem] = useState<SubGoalTimelineItem | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [maxRow, setMaxRow] = useState(3);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(100);
  
  const getDaysInCurrentMonth = () => {
    const daysCount = getDaysInMonth(new Date(currentYear, currentMonth));
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };
  
  const getTimeUnits = () => {
    switch (viewMode) {
      case 'month':
        return getDaysInCurrentMonth();
      case 'year':
        return months;
      default:
        return months;
    }
  };
  
  const timeUnits = getTimeUnits();
  const timeUnitCount = timeUnits.length;
  
  useEffect(() => {
    if (timelineRef.current) {
      const containerWidth = timelineRef.current.clientWidth;
      const calculatedWidth = (containerWidth - 60) / timeUnitCount;
      setCellWidth(Math.max(calculatedWidth, viewMode === 'month' ? 30 : 80));
    }
  }, [timelineRef.current?.clientWidth, viewMode, timeUnitCount]);
  
  // Configure sensors with lower activation constraint for easier dragging
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3, // Reduced from 5 to make dragging more responsive
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 3, // Reduced from 5 to make dragging more responsive on touch devices
      },
    }),
    useSensor(KeyboardSensor, {})
  );
  
  useEffect(() => {
    if (items.length === 0) return;
    
    const maxRowValue = Math.max(...items.map(item => item.row));
    setMaxRow(Math.max(maxRowValue + 1, 3));
  }, [items]);
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggingItemId(active.id as string);
  };
  
  const handleDragMove = (event: DragMoveEvent) => {
    // This is now empty as we'll handle position updates on drag end
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active) {
      setDraggingItemId(null);
      return;
    }
    
    const draggedItem = items.find(item => item.id === active.id);
    if (!draggedItem) {
      setDraggingItemId(null);
      return;
    }
    
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      
      // Get the clientX and clientY coordinates from the dragEnd event
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
      
      // Calculate the position relative to the timeline container
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;
      
      // Convert the pixel position to grid cell coordinates
      const newCell = Math.max(0, Math.min(timeUnitCount - 1, Math.floor(relativeX / cellWidth)));
      const newRow = Math.max(0, Math.min(maxRow - 1, Math.floor(relativeY / 100)));
      
      // Update the item's position
      const updatedItems = items.map(item => {
        if (item.id === draggedItem.id) {
          // Update both start and row for free positioning
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
  
  const handleResizeItem = (itemId: string, newDuration: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        // Only proceed if we have a valid startDate
        if (item.startDate) {
          const startDate = new Date(item.startDate);
          const calculatedEndDate = calculateEndDateFromDurationChange(
            startDate,
            item.duration,
            newDuration,
            viewMode
          );
          
          return {
            ...item,
            duration: newDuration,
            endDate: calculatedEndDate.toISOString()
          };
        }
        
        // If no startDate, just update duration
        return {
          ...item,
          duration: newDuration
        };
      }
      return item;
    });
    
    // Immediately update the items
    onItemsChange(updatedItems);
  };
  
  const handleEditItem = (item: SubGoalTimelineItem) => {
    setSelectedItem(item);
    setOpenForm(true);
  };
  
  const handleAddItem = () => {
    const today = new Date();
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    const newItem: SubGoalTimelineItem = {
      id: `item-${Date.now()}`,
      title: 'New Item',
      description: '',
      progress: 0,
      row: 0,
      start: viewMode === 'month' ? today.getDate() - 1 : today.getMonth(),
      duration: 2,
      startDate: today.toISOString(),
      endDate: oneMonthLater.toISOString()
    };
    
    setSelectedItem(newItem);
    setOpenForm(true);
  };
  
  const handleSaveItem = (item: SubGoalTimelineItem) => {
    const isEditing = items.some(i => i.id === item.id);
    
    if (!item.startDate) {
      const startDate = new Date();
      if (viewMode === 'month') {
        startDate.setDate(item.start + 1);
      } else if (viewMode === 'year') {
        startDate.setMonth(item.start);
      }
      item.startDate = startDate.toISOString();
    }
    
    if (!item.endDate) {
      const startDate = new Date(item.startDate);
      const endDate = new Date(startDate);
      if (viewMode === 'month') {
        endDate.setDate(startDate.getDate() + item.duration - 1);
      } else if (viewMode === 'year') {
        endDate.setMonth(startDate.getMonth() + item.duration - 1);
      }
      endDate.setDate(endDate.getDate());
      item.endDate = endDate.toISOString();
    }
    
    const updatedItems = isEditing
      ? items.map(i => (i.id === item.id ? item : i))
      : [...items, item];
    
    onItemsChange(updatedItems);
    setOpenForm(false);
    setSelectedItem(null);
  };
  
  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsChange(updatedItems);
    setOpenForm(false);
    setSelectedItem(null);
  };
  
  const getHeaderLabel = () => {
    switch (viewMode) {
      case 'month':
        return `${months[currentMonth]} ${currentYear}`;
      case 'year':
        return `${currentYear}`;
      default:
        return `${months[currentMonth]} ${currentYear}`;
    }
  };
  
  const navigatePrevious = () => {
    if (viewMode === 'month') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      setCurrentYear(currentYear - 1);
    }
  };
  
  const navigateNext = () => {
    if (viewMode === 'month') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      setCurrentYear(currentYear + 1);
    }
  };
  
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/70 backdrop-blur-sm overflow-hidden shadow-xl">
      <div className="border-b border-slate-800 p-2 bg-slate-800/50">
        <div className="flex justify-between items-center mb-2">
          <button 
            onClick={navigatePrevious}
            className="px-2 py-1 rounded hover:bg-slate-700 transition-colors"
          >
            &lt;
          </button>
          <h3 className="text-sm font-medium text-slate-300">{getHeaderLabel()}</h3>
          <button 
            onClick={navigateNext}
            className="px-2 py-1 rounded hover:bg-slate-700 transition-colors"
          >
            &gt;
          </button>
        </div>
        <div className="flex">
          {timeUnits.map((unit, idx) => (
            <div 
              key={`unit-${idx}`}
              className="text-center text-xs font-medium text-slate-300"
              style={{ minWidth: `${cellWidth}px`, flexGrow: 1 }}
            >
              {unit}
            </div>
          ))}
        </div>
      </div>
      
      <div 
        className="relative overflow-x-auto"
        style={{ height: `${maxRow * 100 + 50}px` }}
        ref={timelineRef}
      >
        <div className="absolute inset-0 flex pointer-events-none">
          {timeUnits.map((_, idx) => (
            <div 
              key={idx}
              className="h-full border-r border-slate-800/70"
              style={{ width: `${cellWidth}px` }}
            ></div>
          ))}
        </div>
        
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: maxRow }).map((_, idx) => (
            <div 
              key={idx}
              className="w-full border-b border-slate-800/70"
              style={{ height: '100px' }}
            ></div>
          ))}
        </div>
        
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          collisionDetection={pointerWithin}
          modifiers={[restrictToParentElement]}
        >
          <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
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
          </SortableContext>
          
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
