
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
  closestCenter,
  pointerWithin,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';

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
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Get days in month based on current month/year
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getDaysArray = () => {
    const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
    return Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);
  };
  
  const [days, setDays] = useState(getDaysArray());
  const [quarters] = useState(['Q1', 'Q2', 'Q3', 'Q4']);
  const [weeks] = useState(Array.from({ length: 52 }, (_, i) => i + 1));
  
  const [selectedItem, setSelectedItem] = useState<SubGoalTimelineItem | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [maxRow, setMaxRow] = useState(3);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(100);
  
  // Update days when month changes
  useEffect(() => {
    setDays(getDaysArray());
  }, [currentMonth, currentYear]);
  
  const getTimeUnits = () => {
    switch (viewMode) {
      case 'day':
        return days;
      case 'week':
        return weeks.slice(0, 12);
      case 'month':
        return days;
      case 'year':
        return months;
      default:
        return months;
    }
  };
  
  const timeUnits = getTimeUnits();
  const timeUnitCount = timeUnits.length;
  
  // Adjust cell width based on available space and view mode
  useEffect(() => {
    if (timelineRef.current) {
      const containerWidth = timelineRef.current.clientWidth;
      const calculatedWidth = (containerWidth - 60) / timeUnitCount;
      
      setCellWidth(Math.max(calculatedWidth, viewMode === 'year' ? 80 : 30));
    }
  }, [timelineRef.current?.clientWidth, viewMode, timeUnitCount]);
  
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
    // Optional: Implement real-time feedback during drag
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
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
      const relativeX = event.activatorEvent instanceof MouseEvent ? 
        event.activatorEvent.clientX - rect.left : 0;
      const relativeY = event.activatorEvent instanceof MouseEvent ? 
        event.activatorEvent.clientY - rect.top : 0;
      
      const newCell = Math.max(0, Math.min(timeUnitCount - 1, Math.floor(relativeX / cellWidth)));
      const newRow = Math.max(0, Math.min(maxRow - 1, Math.floor(relativeY / ROW_HEIGHT)));
      
      const updatedItems = items.map(item => {
        if (item.id === draggedItem.id) {
          // Create a new instance with updated position
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
  
  // Enhanced resize handler for FL Studio-like behavior
  const handleResizeItem = (itemId: string, newDuration: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        // Calculate exact end date based on duration and view mode
        return {
          ...item,
          duration: newDuration
        };
      }
      return item;
    });
    
    onItemsChange(updatedItems);
  };
  
  const handleEditItem = (item: SubGoalTimelineItem) => {
    setSelectedItem(item);
    setOpenForm(true);
  };
  
  const handleAddItem = () => {
    const newItem: SubGoalTimelineItem = {
      id: `item-${Date.now()}`,
      title: 'New Item',
      description: '',
      progress: 0,
      row: 0,
      start: 0,
      duration: 2,
      category: 'default'
    };
    
    setSelectedItem(newItem);
    setOpenForm(true);
  };
  
  const handleSaveItem = (item: SubGoalTimelineItem) => {
    const isEditing = items.some(i => i.id === item.id);
    
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
      case 'day':
        return 'Hours';
      case 'week':
        return 'Days';
      case 'month':
        return `${months[currentMonth]} ${currentYear}`;
      case 'year':
        return `${currentYear}`;
      default:
        return 'Timeline';
    }
  };
  
  const ROW_HEIGHT = 150;
  
  // Auto-adjust card size based on content
  const handleAutoResizeCards = () => {
    const updatedItems = items.map(item => {
      const titleLength = item.title.length;
      const minCellsNeeded = Math.ceil(titleLength / 10);
      
      if (minCellsNeeded > item.duration) {
        return {
          ...item,
          duration: minCellsNeeded
        };
      }
      return item;
    });
    
    if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
      onItemsChange(updatedItems);
    }
  };
  
  useEffect(() => {
    handleAutoResizeCards();
  }, [items.map(i => i.title).join(''), cellWidth]);
  
  // Navigate to previous month/year
  const handlePrevious = () => {
    if (viewMode === 'month') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (viewMode === 'year') {
      setCurrentYear(currentYear - 1);
    }
  };
  
  // Navigate to next month/year
  const handleNext = () => {
    if (viewMode === 'month') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (viewMode === 'year') {
      setCurrentYear(currentYear + 1);
    }
  };
  
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur-sm overflow-hidden shadow-2xl">
      {/* Header with navigation */}
      <div className="border-b border-slate-800 p-3 bg-slate-800/70 flex justify-between items-center">
        <button 
          onClick={handlePrevious}
          className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-700/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        
        <div className="font-medium text-slate-200">{getHeaderLabel()}</div>
        
        <button 
          onClick={handleNext}
          className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-700/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
      
      {/* Units header (days/months) */}
      <div className="border-b border-slate-800 p-2 bg-slate-800/40">
        <div className="flex">
          {timeUnits.map((unit, idx) => (
            <div 
              key={unit.toString()}
              className="text-center text-sm font-medium text-slate-300"
              style={{ minWidth: `${cellWidth}px`, width: `${cellWidth}px` }}
            >
              {unit}
            </div>
          ))}
        </div>
      </div>
      
      <div 
        className="relative overflow-x-auto p-2"
        style={{ height: `${maxRow * ROW_HEIGHT + 60}px` }}
        ref={timelineRef}
      >
        {/* Timeline grid */}
        <div className="absolute inset-0 flex pointer-events-none">
          {timeUnits.map((_, idx) => (
            <div 
              key={idx}
              className="h-full border-r border-slate-800/50"
              style={{ width: `${cellWidth}px` }}
            ></div>
          ))}
        </div>
        
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: maxRow }).map((_, idx) => (
            <div 
              key={idx}
              className="w-full border-b border-slate-800/50"
              style={{ height: `${ROW_HEIGHT}px` }}
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
          <div className="absolute inset-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="absolute"
                style={{ 
                  top: `${item.row * ROW_HEIGHT + 15}px`,
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
              className="absolute bottom-6 right-6 bg-emerald hover:bg-emerald-600 text-white rounded-full p-3 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </button>
          </div>
          
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
