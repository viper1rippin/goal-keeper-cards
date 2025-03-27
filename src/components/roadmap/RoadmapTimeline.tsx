
import React, { useState, useEffect } from 'react';
import { SubGoalTimelineItem, TimelineViewMode } from './types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SubGoalTimelineForm from './SubGoalTimelineForm';
import { getDaysInMonth } from 'date-fns';
import { 
  calculateEndDateFromDurationChange, 
  syncTimelineItemWithDates,
  updateDatesFromTimelinePosition
} from './utils/timelineUtils';
import { toast } from '@/components/ui/use-toast';
import TimelineHeader from './TimelineHeader';
import TimelineGrid from './TimelineGrid';
import TimelineItems from './TimelineItems';
import AddItemButton from './AddItemButton';
import { useTimelineDrag } from './hooks/useTimelineDrag';

interface RoadmapTimelineProps {
  roadmapId: string;
  items: SubGoalTimelineItem[];
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
  viewMode: TimelineViewMode;
}

const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ 
  roadmapId, 
  items, 
  onItemsChange, 
  viewMode 
}) => {
  const [months] = useState([
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [selectedItem, setSelectedItem] = useState<SubGoalTimelineItem | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [maxRow, setMaxRow] = useState(3);
  const [cellWidth, setCellWidth] = useState(100);
  
  // Get time units based on view mode
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
  
  const getDaysInCurrentMonth = () => {
    const daysCount = getDaysInMonth(new Date(currentYear, currentMonth));
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };
  
  const timeUnits = getTimeUnits();
  const timeUnitCount = timeUnits.length;
  
  // Initialize drag handling
  const {
    timelineRef,
    isDragging,
    draggingItemId,
    ghostPosition,
    handleDragStart
  } = useTimelineDrag({
    items,
    onItemsChange,
    timeUnitCount,
    cellWidth,
    maxRow,
    currentYear,
    currentMonth,
    viewMode
  });
  
  // Sync timeline with dates
  useEffect(() => {
    if (items.length === 0) return;
    
    const syncedItems = items.map(item => 
      syncTimelineItemWithDates(item, currentYear, currentMonth, viewMode)
    );
    
    const hasChanges = syncedItems.some((item, idx) => 
      item.start !== items[idx].start || item.duration !== items[idx].duration
    );
    
    if (hasChanges) {
      onItemsChange(syncedItems);
    }
  }, [items, viewMode, currentMonth, currentYear]);
  
  // Set max row
  useEffect(() => {
    if (items.length === 0) return;
    
    const maxRowValue = Math.max(...items.map(item => item.row));
    setMaxRow(Math.max(maxRowValue + 1, 3));
  }, [items]);
  
  // Calculate cell width
  useEffect(() => {
    if (timelineRef.current) {
      const containerWidth = timelineRef.current.clientWidth;
      const calculatedWidth = (containerWidth - 60) / timeUnitCount;
      setCellWidth(Math.max(calculatedWidth, viewMode === 'month' ? 30 : 80));
    }
  }, [timelineRef.current?.clientWidth, viewMode, timeUnitCount]);
  
  const handleResizeItem = (itemId: string, newDuration: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
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
    const today = new Date(currentYear, currentMonth, 1);
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    const newItem: SubGoalTimelineItem = {
      id: `item-${Date.now()}`,
      title: 'New Item',
      description: '',
      progress: 0,
      row: 0,
      start: viewMode === 'month' ? 0 : today.getMonth(),
      duration: viewMode === 'month' ? 7 : 2,
      startDate: today.toISOString(),
      endDate: oneMonthLater.toISOString()
    };
    
    setSelectedItem(newItem);
    setOpenForm(true);
  };
  
  const handleSaveItem = (item: SubGoalTimelineItem) => {
    const isEditing = items.some(i => i.id === item.id);
    
    if (!item.startDate || !item.endDate) {
      const { startDate, endDate } = updateDatesFromTimelinePosition(
        item.start,
        item.duration,
        currentYear,
        currentMonth,
        viewMode
      );
      
      item.startDate = startDate.toISOString();
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
      <TimelineHeader
        months={months}
        timeUnits={timeUnits}
        cellWidth={cellWidth}
        currentMonth={currentMonth}
        currentYear={currentYear}
        viewMode={viewMode}
        onNavigatePrevious={navigatePrevious}
        onNavigateNext={navigateNext}
      />
      
      <div 
        className="relative overflow-x-auto"
        style={{ height: `${maxRow * 100 + 50}px` }}
        ref={timelineRef}
      >
        <TimelineGrid
          timeUnits={timeUnits}
          maxRow={maxRow}
          cellWidth={cellWidth}
        />
        
        <TimelineItems
          items={items}
          selectedItem={selectedItem}
          cellWidth={cellWidth}
          viewMode={viewMode}
          isDragging={isDragging}
          draggingItemId={draggingItemId}
          ghostPosition={ghostPosition}
          onEditItem={handleEditItem}
          onResizeItem={handleResizeItem}
          onSelectItem={setSelectedItem}
          onDragStart={handleDragStart}
        />
        
        <AddItemButton onClick={handleAddItem} />
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
