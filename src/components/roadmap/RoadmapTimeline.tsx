
import React, { useState, useRef, useEffect } from "react";
import { SubGoalTimelineItem } from "./types";
import TimelineCard from "./TimelineCard";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, Plus, Star, Clock, Monitor, Database } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubGoalTimelineForm } from "./SubGoalTimelineForm";

// Quarters for the timeline
const quarters = ["Q1", "Q2", "Q3", "Q4"];

// Month names for the timeline
const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

interface RoadmapTimelineProps {
  roadmapId: string;
  items: SubGoalTimelineItem[];
  onItemsChange: (items: SubGoalTimelineItem[]) => void;
}

const RoadmapTimeline = ({ roadmapId, items, onItemsChange }: RoadmapTimelineProps) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubGoalTimelineItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Timeline sizing
  const monthWidth = 90; // Width of each month cell (smaller to fit more)
  const rowHeight = 80; // Height of each row
  const numRows = 6; // Number of rows in the timeline
  const totalMonths = 12; // Full year view
  
  // Configure drag sensors with lower activation constraint
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Makes it easier to start dragging
      },
    })
  );
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };
  
  // Handle drag end - update positions
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const activeItem = items.find(item => item.id === active.id);
    const overItem = items.find(item => item.id === over.id);
    
    if (!activeItem || !overItem) return;
    
    // Calculate new position
    const activeIndex = items.findIndex(item => item.id === active.id);
    const overIndex = items.findIndex(item => item.id === over.id);
    
    // First reorder the items
    let newItems = arrayMove(items, activeIndex, overIndex);
    
    // Then adjust the position of the moved item
    const draggedItem = {...newItems[overIndex]};
    
    if (active.rect && over.rect) {
      // Calculate approximate horizontal position change
      const dragDeltaX = active.delta.x;
      
      // Adjust start month based on horizontal delta
      const monthShift = Math.round(dragDeltaX / monthWidth);
      
      // Determine the new start position
      const newStart = Math.max(0, activeItem.start + monthShift);
      const maxStart = totalMonths - draggedItem.duration;
      draggedItem.start = Math.min(newStart, maxStart);
      
      // Determine the row based on vertical position
      if (activeItem.row !== overItem.row) {
        draggedItem.row = overItem.row;
      }
      
      // Update the item in our array
      newItems[overIndex] = draggedItem;
    }
    
    onItemsChange(newItems);
  };
  
  // Handle selecting an item
  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId === selectedItemId ? null : itemId);
  };
  
  // Handle editing an item
  const handleEditItem = (item: SubGoalTimelineItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };
  
  // Handle saving edited or new item
  const handleSaveItem = (item: SubGoalTimelineItem) => {
    let updatedItems: SubGoalTimelineItem[];
    
    if (editingItem) {
      // Update existing item
      updatedItems = items.map(existing => 
        existing.id === item.id ? item : existing
      );
    } else {
      // Add new item
      updatedItems = [...items, item];
    }
    
    onItemsChange(updatedItems);
    setDialogOpen(false);
    setEditingItem(null);
  };
  
  // Add a new item
  const handleAddItem = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };
  
  // Generate a new unique ID for new items
  const generateId = () => {
    return `timeline-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };
  
  return (
    <Card className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/40 overflow-hidden relative">
      {/* Quarter headers */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/60 relative z-10 bg-white/50 dark:bg-black/20">
        {quarters.map((quarter, index) => (
          <div 
            key={quarter}
            className="flex-shrink-0 py-3 font-bold text-center text-slate-700 dark:text-slate-300 border-r last:border-r-0 border-slate-200 dark:border-slate-800/60"
            style={{ width: `${monthWidth * 3}px` }}
          >
            {quarter}
          </div>
        ))}
      </div>
      
      {/* Month headers */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/60 relative z-10 bg-white/30 dark:bg-black/10">
        {months.map((month, index) => (
          <div 
            key={month}
            className={cn(
              "flex-shrink-0 px-2 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 border-r last:border-r-0 border-slate-200/50 dark:border-slate-800/30 text-center",
              (index + 1) % 3 === 0 ? "border-r border-r-slate-300 dark:border-r-slate-700" : ""
            )}
            style={{ width: `${monthWidth}px` }}
          >
            {month.substring(0, 3)}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white/50 dark:bg-black/20 border-b border-slate-200 dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-amber-500 to-amber-600"></div>
          <span className="text-slate-700 dark:text-slate-300">Feature</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-rose-400 to-rose-500"></div>
          <span className="text-slate-700 dark:text-slate-300">Mobile</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
          <span className="text-slate-700 dark:text-slate-300">Web</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-blue-400 to-blue-500"></div>
          <span className="text-slate-700 dark:text-slate-300">Infrastructure</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-purple-400 to-purple-500"></div>
          <span className="text-slate-700 dark:text-slate-300">Backend</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-gray-500 to-gray-600"></div>
          <span className="text-slate-700 dark:text-slate-300">Milestone</span>
        </div>
      </div>
      
      {/* Timeline grid */}
      <div 
        ref={containerRef}
        className="relative overflow-x-auto"
        style={{ height: `${rowHeight * numRows + 20}px` }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0">
          {/* Vertical quarter lines */}
          {quarters.map((_, index) => (
            <div 
              key={index}
              className="absolute top-0 bottom-0 border-l border-slate-300 dark:border-slate-700"
              style={{ left: `${index * monthWidth * 3}px` }}
            />
          ))}
          
          {/* Vertical month lines */}
          {months.map((_, index) => (
            <div 
              key={index}
              className={cn(
                "absolute top-0 bottom-0 border-l",
                (index + 1) % 3 === 0
                  ? "border-slate-300 dark:border-slate-700"
                  : "border-slate-200/50 dark:border-slate-800/30"
              )}
              style={{ left: `${index * monthWidth}px` }}
            />
          ))}
          
          {/* Horizontal row lines */}
          {Array.from({ length: numRows }).map((_, index) => (
            <div 
              key={index}
              className={cn(
                "absolute left-0 right-0 border-t",
                index === 0
                  ? "border-slate-300 dark:border-slate-700"
                  : "border-slate-200/70 dark:border-slate-800/50"
              )}
              style={{ top: `${index * rowHeight}px` }}
            />
          ))}
        </div>
        
        {/* Timeline cards */}
        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <SortableContext items={items.map(item => item.id)}>
            {items.map((item) => (
              <div 
                key={item.id}
                className="absolute"
                style={{
                  top: `${item.row * rowHeight}px`,
                  height: `${rowHeight}px`,
                  width: '100%'
                }}
              >
                <TimelineCard 
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleSelectItem(item.id)}
                  onEdit={() => handleEditItem(item)}
                  monthWidth={monthWidth}
                />
              </div>
            ))}
          </SortableContext>
        </DndContext>
        
        {/* Add button (fixed at bottom right) */}
        <Button
          onClick={handleAddItem}
          className="absolute bottom-4 right-4 bg-emerald hover:bg-emerald-600 text-white z-20"
        >
          <Plus size={16} className="mr-2" />
          Add Item
        </Button>
      </div>
      
      {/* Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingItem ? "Edit Roadmap Item" : "Add New Roadmap Item"}
            </DialogTitle>
          </DialogHeader>
          
          <SubGoalTimelineForm
            item={editingItem}
            roadmapId={roadmapId}
            onSave={handleSaveItem}
            onCancel={() => setDialogOpen(false)}
            generateId={generateId}
            maxRows={numRows}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RoadmapTimeline;
