
import React, { useState, useRef, useEffect } from "react";
import { SubGoalTimelineItem } from "./types";
import TimelineCard from "./TimelineCard";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubGoalTimelineForm } from "./SubGoalTimelineForm";

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
  const monthWidth = 150; // Width of each month cell
  const rowHeight = 100; // Height of each row
  const numRows = 5; // Number of rows in the timeline
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
    // This is a simplified approximation of the drag position
    // In a real app, you'd calculate this based on the drag delta
    const draggedItem = {...newItems[overIndex]};
    
    // For horizontal positioning, we can approximate based on the over item's position
    if (active.rect.current && over.rect.current) {
      const dragDeltaX = active.rect.current.left - over.rect.current.left;
      
      // Adjust start month based on horizontal delta
      // Calculate the number of months to shift based on drag distance
      const monthShift = Math.round(dragDeltaX / monthWidth);
      
      // Determine the new start position
      const newStart = Math.max(0, overItem.start - monthShift);
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
  
  // Handle modifying item duration (extend/shrink)
  const handleResize = (itemId: string, newDuration: number) => {
    const updatedItems = items.map(item => 
      item.id === itemId 
        ? { ...item, duration: Math.max(1, Math.min(12, newDuration)) } 
        : item
    );
    onItemsChange(updatedItems);
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
  
  // Create background grid with random stars
  const createStarField = () => {
    const stars = [];
    const numStars = 200;
    
    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 1.5;
      const opacity = Math.random() * 0.5 + 0.1;
      const animationDuration = Math.random() * 10 + 5;
      
      stars.push(
        <div 
          key={i}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            opacity,
            animationDuration: `${animationDuration}s`,
          }}
        />
      );
    }
    
    return stars;
  };
  
  return (
    <Card className="bg-slate-950 border-slate-800/40 overflow-hidden relative">
      {/* Star field background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {createStarField()}
      </div>
      
      {/* Month headers */}
      <div className="flex border-b border-slate-800/60 relative z-10">
        {months.map((month, index) => (
          <div 
            key={month}
            className="flex-shrink-0 px-4 py-2 text-xs font-medium text-emerald/80"
            style={{ width: `${monthWidth}px` }}
          >
            {month}
          </div>
        ))}
      </div>
      
      {/* Timeline grid */}
      <div 
        ref={containerRef}
        className="relative overflow-x-auto"
        style={{ height: `${rowHeight * numRows + 40}px` }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0">
          {/* Vertical month lines */}
          {months.map((_, index) => (
            <div 
              key={index}
              className="absolute top-0 bottom-0 border-l border-slate-800/30"
              style={{ left: `${index * monthWidth}px` }}
            />
          ))}
          
          {/* Horizontal row lines */}
          {Array.from({ length: numRows }).map((_, index) => (
            <div 
              key={index}
              className="absolute left-0 right-0 border-t border-slate-800/30"
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
          className="absolute bottom-4 right-4 bg-emerald/80 hover:bg-emerald text-white z-20"
        >
          <Plus size={16} className="mr-2" />
          Add Goal
        </Button>
      </div>
      
      {/* Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingItem ? "Edit Goal" : "Add New Goal"}
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
