import React, { useState, useRef, useEffect } from 'react';
import { 
  SubGoalTimelineItem, 
  TimelineViewMode,
  TimelineViewport
} from './types';
import { ScrollArea } from "@/components/ui/scroll-area";
import TimelineCard from './TimelineCard';
import { format, addMonths, addDays, startOfMonth, endOfMonth, differenceInDays, startOfYear, endOfYear, addYears } from 'date-fns';
import { cn } from '@/lib/utils';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, pointerWithin } from '@dnd-kit/core';

interface InfiniteTimelineProps {
  items: SubGoalTimelineItem[];
  viewMode: TimelineViewMode;
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
  onViewportChange?: (viewport: TimelineViewport) => void;
}

const InfiniteTimeline: React.FC<InfiniteTimelineProps> = ({
  items,
  viewMode,
  onItemsChange,
  onViewportChange
}) => {
  const today = new Date();
  const [centerDate, setCenterDate] = useState(today);
  const [visibleTimeUnits, setVisibleTimeUnits] = useState<Array<{ label: string, date: Date }>>([]);
  const [selectedItem, setSelectedItem] = useState<SubGoalTimelineItem | null>(null);
  const [maxRows, setMaxRows] = useState(5);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timelineAreaRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const cellWidth = viewMode === 'year' ? 100 : 80;
  const cellHeight = 90;
  const bufferUnits = 6;
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    let units: Array<{ label: string, date: Date }> = [];
    
    if (viewMode === 'month') {
      const firstDay = startOfMonth(centerDate);
      const lastDay = endOfMonth(centerDate);
      const daysInMonth = differenceInDays(lastDay, firstDay) + 1;
      
      const previousMonthDays = 3;
      const nextMonthDays = 3;
      
      for (let i = previousMonthDays; i > 0; i--) {
        const date = addDays(firstDay, -i);
        units.push({
          label: format(date, 'd'),
          date
        });
      }
      
      for (let i = 0; i < daysInMonth; i++) {
        const date = addDays(firstDay, i);
        units.push({
          label: format(date, 'd'),
          date
        });
      }
      
      for (let i = 1; i <= nextMonthDays; i++) {
        const date = addDays(lastDay, i);
        units.push({
          label: format(date, 'd'),
          date
        });
      }
    } else if (viewMode === 'year') {
      const startYear = startOfYear(centerDate);
      
      for (let i = -6; i <= 18; i++) {
        const date = addMonths(startYear, i);
        units.push({
          label: format(date, 'MMM'),
          date
        });
      }
    }
    
    setVisibleTimeUnits(units);
    
    if (units.length > 0 && onViewportChange) {
      onViewportChange({
        startUnit: 0,
        endUnit: units.length - 1,
        viewMode,
        startDate: units[0].date,
        endDate: units[units.length - 1].date
      });
    }
  }, [viewMode, centerDate, onViewportChange]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const containerWidth = scrollContainerRef.current.clientWidth;
    const totalWidth = visibleTimeUnits.length * cellWidth;
    
    if (scrollLeft < containerWidth * 0.2) {
      if (viewMode === 'month') {
        setCenterDate(addMonths(centerDate, -1));
      } else {
        setCenterDate(addYears(centerDate, -1));
      }
    } else if (scrollLeft > totalWidth - containerWidth * 1.2) {
      if (viewMode === 'month') {
        setCenterDate(addMonths(centerDate, 1));
      } else {
        setCenterDate(addYears(centerDate, 1));
      }
    }
    
    if (headerRef.current) {
      headerRef.current.scrollLeft = scrollLeft;
    }
  };

  useEffect(() => {
    if (items.length === 0) return;
    const highestRow = Math.max(...items.map(item => item.row));
    setMaxRows(Math.max(highestRow + 2, 5));
  }, [items]);

  const positionedItems = items.map(item => {
    const itemStartUnit = visibleTimeUnits.findIndex(unit => 
      item.date ? 
        format(unit.date, 'yyyy-MM-dd') === format(new Date(item.date), 'yyyy-MM-dd') : 
        false
    );
    
    const startPosition = itemStartUnit >= 0 ? itemStartUnit : item.start;
    
    return {
      ...item,
      startPosition,
      visualPosition: {
        left: startPosition * cellWidth,
        top: item.row * cellHeight,
        width: item.duration * cellWidth,
        height: cellHeight - 10
      }
    };
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!timelineAreaRef.current) return;
    
    const dragOffset = event.delta;
    const draggedItemId = active.id as string;
    
    const draggedItem = items.find(item => item.id === draggedItemId);
    if (!draggedItem) return;
    
    const rect = timelineAreaRef.current.getBoundingClientRect();
    
    let pointerX = 0;
    let pointerY = 0;
    
    if (event.activatorEvent instanceof MouseEvent) {
      pointerX = event.activatorEvent.clientX;
      pointerY = event.activatorEvent.clientY;
    } else if ('clientX' in event.activatorEvent && 'clientY' in event.activatorEvent) {
      const customEvent = event.activatorEvent as { clientX: number; clientY: number };
      pointerX = customEvent.clientX;
      pointerY = customEvent.clientY;
    }
    
    const relativeX = pointerX - rect.left;
    const relativeY = pointerY - rect.top;
    
    const newStartUnit = Math.max(0, Math.floor(relativeX / cellWidth));
    const newRow = Math.max(0, Math.min(maxRows - 1, Math.floor(relativeY / cellHeight)));
    
    const updatedItems = items.map(item => {
      if (item.id === draggedItemId) {
        const newDate = newStartUnit < visibleTimeUnits.length ? 
          visibleTimeUnits[newStartUnit].date : undefined;
        
        return {
          ...item,
          start: newStartUnit,
          row: newRow,
          date: newDate
        };
      }
      return item;
    });
    
    onItemsChange(updatedItems);
  };

  const handleResizeItem = (itemId: string, newDuration: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const startDate = item.date ? new Date(item.date) : undefined;
        const endDate = startDate ? 
          (viewMode === 'month' ? 
            addDays(startDate, newDuration - 1) : 
            addMonths(startDate, newDuration - 1)
          ) : undefined;
        
        return {
          ...item,
          duration: newDuration,
          endDate
        };
      }
      return item;
    });
    
    onItemsChange(updatedItems);
  };

  return (
    <div className="flex flex-col h-full border border-slate-800 rounded-lg overflow-hidden">
      <div 
        ref={headerRef}
        className="flex overflow-hidden bg-slate-800/50 border-b border-slate-700"
      >
        <div className="flex min-w-max">
          {visibleTimeUnits.map((unit, index) => (
            <div 
              key={`header-${index}`}
              className={cn(
                "text-center text-sm font-medium p-2 border-r border-slate-700",
                format(unit.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? 
                  "bg-emerald-800/20 text-emerald-400" : "text-slate-300"
              )}
              style={{ width: `${cellWidth}px` }}
            >
              {unit.label}
              {viewMode === 'month' && index % 7 === 0 && (
                <div className="text-xs text-slate-400">
                  {format(unit.date, 'MMM yyyy')}
                </div>
              )}
              {viewMode === 'year' && index % 12 === 0 && (
                <div className="text-xs text-slate-400">
                  {format(unit.date, 'yyyy')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <ScrollArea className="h-full relative" onWheel={e => e.stopPropagation()}>
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto h-full"
          onScroll={handleScroll}
        >
          <div 
            ref={timelineAreaRef}
            className="relative"
            style={{ 
              width: `${visibleTimeUnits.length * cellWidth}px`,
              height: `${maxRows * cellHeight}px`,
              minHeight: '500px'
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              {visibleTimeUnits.map((_, index) => (
                <div 
                  key={`vgrid-${index}`}
                  className={cn(
                    "absolute top-0 bottom-0 border-r",
                    index % (viewMode === 'year' ? 12 : 7) === 0 ? 
                      "border-slate-600" : "border-slate-800/50"
                  )}
                  style={{ left: `${index * cellWidth}px` }}
                />
              ))}
              
              {Array.from({ length: maxRows }).map((_, index) => (
                <div 
                  key={`hgrid-${index}`}
                  className="absolute left-0 right-0 border-b border-slate-800/50"
                  style={{ top: `${index * cellHeight}px` }}
                />
              ))}
              
              {visibleTimeUnits.map((unit, index) => {
                if (format(unit.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && viewMode === 'month') {
                  return (
                    <div 
                      key="today-indicator"
                      className="absolute top-0 bottom-0 border-l-2 border-emerald-500/50 z-10"
                      style={{ left: `${index * cellWidth}px` }}
                    />
                  );
                }
                if (format(unit.date, 'yyyy-MM') === format(today, 'yyyy-MM') && viewMode === 'year' && format(unit.date, 'MMM') === format(today, 'MMM')) {
                  return (
                    <div 
                      key="current-month-indicator"
                      className="absolute top-0 bottom-0 border-l-2 border-emerald-500/50 z-10"
                      style={{ left: `${index * cellWidth}px` }}
                    />
                  );
                }
                return null;
              })}
            </div>
            
            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}
              collisionDetection={pointerWithin}
            >
              {positionedItems.map(item => (
                <div
                  key={item.id}
                  className="absolute"
                  style={{
                    left: `${item.visualPosition.left}px`,
                    top: `${item.visualPosition.top}px`,
                    width: `${item.visualPosition.width}px`
                  }}
                >
                  <TimelineCard
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onSelect={() => setSelectedItem(item)}
                    onResize={handleResizeItem}
                    cellWidth={cellWidth}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </DndContext>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default InfiniteTimeline;
