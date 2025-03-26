
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
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TimelineCategory } from "@/components/roadmap/types";

interface RoadmapTimelineProps {
  roadmapId: string;
  items: SubGoalTimelineItem[];
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
  viewMode: TimelineViewMode;
  isSaving?: boolean;
}

const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ 
  roadmapId, 
  items, 
  onItemsChange, 
  viewMode,
  isSaving = false
}) => {
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
  
  const { user } = useAuth();

  const getExtendedTimeUnits = () => {
    if (viewMode === 'month') {
      return [
        ...days.map(day => `P-${day}`),
        ...days,
        ...days.map(day => `N-${day}`),
      ];
    } else {
      return [
        ...months.map(month => `PY-${month}`),
        ...months,
        ...months.map(month => `NY-${month}`),
      ];
    }
  };
  
  const timeUnits = getExtendedTimeUnits();
  const timeUnitCount = timeUnits.length;

  const formatTimeUnitLabel = (unit: string | number) => {
    if (typeof unit === 'number') {
      return unit;
    }
    
    if (typeof unit === 'string') {
      if (unit.startsWith('P-') || unit.startsWith('N-')) {
        return unit.substring(2);
      }
      if (unit.startsWith('PY-') || unit.startsWith('NY-')) {
        return unit.substring(3);
      }
    }
    
    return unit;
  };
  
  useEffect(() => {
    if (timelineRef.current) {
      const containerWidth = timelineRef.current.clientWidth;
      const calculatedWidth = (containerWidth - 60) / timeUnitCount;
      
      setCellWidth(Math.max(calculatedWidth, 100));
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
    // This can be used for visual feedback during drag
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
  
  const handleResizeItem = async (itemId: string, newDuration: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          duration: newDuration
        };
      }
      return item;
    });
    
    // Update UI immediately
    onItemsChange(updatedItems);
  };
  
  const handleEditItem = (item: SubGoalTimelineItem) => {
    setSelectedItem(item);
    setOpenForm(true);
  };
  
  const handleAddItem = async () => {
    if (!user || !roadmapId) {
      toast({
        title: "Error",
        description: "You must be logged in to add items.",
        variant: "destructive"
      });
      return;
    }
    
    // Generate a temporary ID
    const tempId = `item-${Date.now()}`;
    
    const newItem: SubGoalTimelineItem = {
      id: tempId,
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
  
  const handleSaveItem = async (item: SubGoalTimelineItem) => {
    const isEditing = items.some(i => i.id === item.id);
    let updatedItems: SubGoalTimelineItem[] = [];
    
    // For new items, we need to create them in the database first
    if (!isEditing && item.id.startsWith('item-') && user && roadmapId) {
      try {
        const { data, error } = await supabase
          .from('sub_goals')
          .insert({
            title: item.title,
            description: item.description,
            parent_goal_id: roadmapId,
            user_id: user.id,
            progress: item.progress,
            timeline_row: item.row,
            timeline_start: item.start,
            timeline_duration: item.duration,
            timeline_category: item.category
          })
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Replace the temporary item with the one from the database
          const newItem: SubGoalTimelineItem = {
            id: data.id,
            title: data.title,
            description: data.description,
            row: data.timeline_row || 0,
            start: data.timeline_start || 0,
            duration: data.timeline_duration || 2,
            progress: data.progress || 0,
            category: (data.timeline_category as TimelineCategory) || 'default',
            parentId: roadmapId,
            originalSubGoalId: data.id
          };
          
          updatedItems = [...items, newItem];
        }
      } catch (error) {
        console.error('Error creating sub-goal:', error);
        toast({
          title: "Error",
          description: "Failed to create new item. Please try again.",
          variant: "destructive"
        });
        setOpenForm(false);
        setSelectedItem(null);
        return;
      }
    } else {
      // For existing items, just update the items array
      updatedItems = isEditing
        ? items.map(i => (i.id === item.id ? item : i))
        : [...items, item];
    }
    
    onItemsChange(updatedItems);
    setOpenForm(false);
    setSelectedItem(null);
  };
  
  const handleDeleteItem = async (itemId: string) => {
    // Check if this is a real database item (not a temporary one)
    const itemToDelete = items.find(item => item.id === itemId);
    
    if (itemToDelete?.originalSubGoalId && user) {
      try {
        const { error } = await supabase
          .from('sub_goals')
          .delete()
          .eq('id', itemToDelete.originalSubGoalId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
      } catch (error) {
        console.error('Error deleting sub-goal:', error);
        toast({
          title: "Error",
          description: "Failed to delete item. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }
    
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
  
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur-sm overflow-hidden shadow-2xl">
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
      
      <ScrollArea className="h-[calc(100vh-250px)]">
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
                disabled={isSaving}
                className={`absolute bottom-6 right-6 bg-emerald hover:bg-emerald-600 text-white rounded-full p-3 shadow-lg ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                )}
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
