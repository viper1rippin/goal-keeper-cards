import React, { useState, useRef, useEffect } from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from './types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SubGoalTimelineForm from './SubGoalTimelineForm';
import TimelineCard from './TimelineCard';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  viewMode: TimelineViewMode;
}

const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ roadmapId, items, onItemsChange, viewMode }) => {
  const [months] = useState([
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]);
  const [days] = useState(Array.from({ length: 31 }, (_, i) => i + 1));
  
  const [selectedItem, setSelectedItem] = useState<SubGoalTimelineItem | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [maxRow, setMaxRow] = useState(3);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(100);
  
  // Expanded time units for seamless scrolling
  const getExtendedTimeUnits = () => {
    if (viewMode === 'month') {
      // For month view, show 3 months worth of days (previous, current, next)
      return [
        ...days.map(day => `P-${day}`), // Previous month days
        ...days, // Current month days
        ...days.map(day => `N-${day}`), // Next month days
      ];
    } else {
      // For year view, show 3 years worth of months (previous, current, next)
      return [
        ...months.map(month => `PY-${month}`), // Previous year months
        ...months, // Current year months
        ...months.map(month => `NY-${month}`), // Next year months
      ];
    }
  };
  
  const timeUnits = getExtendedTimeUnits();
  const timeUnitCount = timeUnits.length;

  // Modified version to handle display formatting of time unit labels
  const formatTimeUnitLabel = (unit: string | number) => {
    if (typeof unit === 'number') {
      return unit; // Simple day number
    }
    
    // For the extended time units with prefixes
    if (typeof unit === 'string') {
      if (unit.startsWith('P-') || unit.startsWith('N-')) {
        return unit.substring(2); // Remove the prefix for display
      }
      if (unit.startsWith('PY-') || unit.startsWith('NY-')) {
        return unit.substring(3); // Remove the prefix for display
      }
    }
    
    return unit;
  };
  
  useEffect(() => {
    if (timelineRef.current) {
      const containerWidth = timelineRef.current.clientWidth;
      const calculatedWidth = (containerWidth - 60) / 31; // Display one month at a time
      
      setCellWidth(Math.max(calculatedWidth, 90)); // Slightly smaller cells for more visibility
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
      const newRow = Math.max(0, Math.min(maxRow - 1, Math.floor(relativeY / 100)));
      
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
      case 'month':
        return 'Days';
      case 'year':
        return 'Months';
      default:
        return 'Months';
    }
  };
  
  const ROW_HEIGHT = 150;
  
  const handleAutoResizeCards = () => {
    const updatedItems = items.map(item => {
      const titleLength = item.title.length;
      const minCellsNeeded = Math.ceil(titleLength / 8); // Adjust more aggressively to ensure titles fit
      
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
  
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur-sm overflow-hidden shadow-2xl">
      {/* Horizontal scrollable header for time units */}
      <ScrollArea className="w-full overflow-auto" orientation="horizontal">
        <div className="border-b border-slate-800 p-3 bg-slate-800/70 min-w-fit" style={{ width: `${timeUnitCount * cellWidth + 60}px` }}>
          <div className="flex">
            {timeUnits.map((unit, idx) => (
              <div 
                key={idx.toString() + unit.toString()}
                className="text-center text-sm font-medium text-slate-300"
                style={{ minWidth: `${cellWidth}px`, flexGrow: 1 }}
              >
                {formatTimeUnitLabel(unit)}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
      
      {/* Main scrollable timeline content - now with horizontal scrolling */}
      <ScrollArea className="h-[calc(100vh-250px)]" orientation="both">
        <div 
          className="relative p-2"
          style={{ height: `${maxRow * ROW_HEIGHT + 60}px`, minWidth: `${timeUnitCount * cellWidth + 60}px` }}
          ref={timelineRef}
        >
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
      </ScrollArea>
      
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


