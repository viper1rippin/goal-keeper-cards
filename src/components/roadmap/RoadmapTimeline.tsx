
import React, { useState, useRef, useEffect } from "react";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addYears, subYears, differenceInDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TimelineSubGoalCard from "./TimelineSubGoalCard";
import TimelineSubGoalDialog from "./TimelineSubGoalDialog";
import { Goal } from "@/components/GoalRow";

// Define timeline views
type TimelineView = "month" | "year";

// Define the timeline item interface that extends Goal
export interface TimelineItem extends Goal {
  startDate: Date | null;
  endDate: Date | null;
  parentGoalId: string;
  parentGoalTitle: string;
}

// Define parent goal interface
interface ParentGoal {
  id: string;
  title: string;
  description: string;
}

const RoadmapTimeline: React.FC = () => {
  // State for the current date and view
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<TimelineView>("month");
  const [selectedParentGoalId, setSelectedParentGoalId] = useState<string | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [editItem, setEditItem] = useState<TimelineItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Fetch parent goals from the database
  useEffect(() => {
    if (!user) return;
    
    const fetchParentGoals = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('parent_goals')
          .select('id, title, description')
          .eq('user_id', user.id)
          .order('position', { ascending: true });
          
        if (error) throw error;
        
        setParentGoals(data || []);
        
        // Select the first parent goal by default
        if (data && data.length > 0 && !selectedParentGoalId) {
          setSelectedParentGoalId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching parent goals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load parent goals',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParentGoals();
  }, [user, toast]);
  
  // Fetch sub-goals for the selected parent goal
  useEffect(() => {
    if (!user || !selectedParentGoalId) return;
    
    const fetchSubGoals = async () => {
      try {
        setIsLoading(true);
        
        const { data: parentGoalData, error: parentGoalError } = await supabase
          .from('parent_goals')
          .select('title')
          .eq('id', selectedParentGoalId)
          .single();
          
        if (parentGoalError) throw parentGoalError;
        
        const parentGoalTitle = parentGoalData?.title || '';
        
        const { data, error } = await supabase
          .from('sub_goals')
          .select('*')
          .eq('parent_goal_id', selectedParentGoalId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Format sub-goals as timeline items
        const formattedItems: TimelineItem[] = (data || []).map(subGoal => ({
          id: subGoal.id,
          title: subGoal.title,
          description: subGoal.description,
          progress: subGoal.progress,
          startDate: subGoal.start_date ? new Date(subGoal.start_date) : null,
          endDate: subGoal.end_date ? new Date(subGoal.end_date) : null,
          parentGoalId: selectedParentGoalId,
          parentGoalTitle: parentGoalTitle
        }));
        
        setTimelineItems(formattedItems);
      } catch (error) {
        console.error('Error fetching sub-goals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sub-goals',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubGoals();
  }, [user, selectedParentGoalId, toast]);
  
  // Navigate to previous period (month or year)
  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(prevDate => subMonths(prevDate, 1));
    } else {
      setCurrentDate(prevDate => subYears(prevDate, 1));
    }
  };
  
  // Navigate to next period (month or year)
  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(prevDate => addMonths(prevDate, 1));
    } else {
      setCurrentDate(prevDate => addYears(prevDate, 1));
    }
  };
  
  // Get days for the month view
  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };
  
  // Get months for the year view
  const getMonthsInYear = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), i, 1);
      months.push(date);
    }
    return months;
  };
  
  // Handle dialog open for editing an item
  const handleEditItem = (item: TimelineItem) => {
    setEditItem(item);
    setIsDialogOpen(true);
  };
  
  // Handle creating a new sub-goal
  const handleCreateSubGoal = (date: Date) => {
    if (!selectedParentGoalId) {
      toast({
        title: 'No parent goal selected',
        description: 'Please select a parent goal first',
        variant: 'destructive',
      });
      return;
    }
    
    const parentGoal = parentGoals.find(pg => pg.id === selectedParentGoalId);
    if (!parentGoal) return;
    
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 7); // Default to 7-day duration
    
    const newItem: TimelineItem = {
      id: '', // Will be assigned by database
      title: 'New Sub-Goal',
      description: 'Description',
      progress: 0,
      startDate: date,
      endDate: endDate,
      parentGoalId: selectedParentGoalId,
      parentGoalTitle: parentGoal.title
    };
    
    setEditItem(newItem);
    setIsDialogOpen(true);
  };
  
  // Handle timeline item update from dialog
  const handleUpdateItem = async (updatedItem: TimelineItem) => {
    try {
      setIsLoading(true);
      
      // Extract data for database update
      const { id, title, description, progress, startDate, endDate, parentGoalId } = updatedItem;
      
      // If the item has an ID, update it; otherwise, create a new one
      if (id) {
        // Update existing sub-goal
        const { error } = await supabase
          .from('sub_goals')
          .update({
            title,
            description,
            progress,
            start_date: startDate?.toISOString(),
            end_date: endDate?.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user?.id);
          
        if (error) throw error;
        
        // Update the local state
        setTimelineItems(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ));
        
        toast({
          title: 'Success',
          description: 'Sub-goal updated successfully',
        });
      } else {
        // Create new sub-goal
        const { data, error } = await supabase
          .from('sub_goals')
          .insert({
            title,
            description,
            progress,
            start_date: startDate?.toISOString(),
            end_date: endDate?.toISOString(),
            user_id: user?.id,
            parent_goal_id: parentGoalId
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Add the new item to the local state with its assigned ID
        const newItem: TimelineItem = {
          ...updatedItem,
          id: data.id
        };
        
        setTimelineItems(prev => [...prev, newItem]);
        
        toast({
          title: 'Success',
          description: 'Sub-goal created successfully',
        });
      }
    } catch (error) {
      console.error('Error updating sub-goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sub-goal',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };
  
  // Handle timeline item deletion
  const handleDeleteItem = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('sub_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      // Update the local state
      setTimelineItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Sub-goal deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting sub-goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete sub-goal',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };
  
  // Handle item resize
  const handleItemResize = async (id: string, startDate: Date, endDate: Date) => {
    try {
      // Update local state first for immediate feedback
      setTimelineItems(prev => prev.map(item => 
        item.id === id ? { ...item, startDate, endDate } : item
      ));
      
      // Update in database
      const { error } = await supabase
        .from('sub_goals')
        .update({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error updating sub-goal dates:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sub-goal dates',
        variant: 'destructive',
      });
      
      // Refetch to restore correct state
      if (selectedParentGoalId) {
        // Trigger refetch by changing state
        setSelectedParentGoalId(prevId => {
          setTimeout(() => setSelectedParentGoalId(prevId), 0);
          return prevId;
        });
      }
    }
  };
  
  // Calculate position and width for timeline items
  const calculateItemStyle = (item: TimelineItem, containerWidth: number, days: Date[]) => {
    if (!item.startDate || !item.endDate) return { display: 'none' };
    
    // For month view
    if (view === "month") {
      // Check if the item overlaps with the current month
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      // If item is not in this month at all, don't display
      if (item.endDate < start || item.startDate > end) {
        return { display: 'none' };
      }
      
      // Calculate the item's position
      const dayWidth = containerWidth / days.length;
      
      // Adjust start date to first day of month if it's before
      const effectiveStartDate = item.startDate < start ? start : item.startDate;
      
      // Adjust end date to last day of month if it's after
      const effectiveEndDate = item.endDate > end ? end : item.endDate;
      
      // Calculate position (left offset)
      const startOffset = differenceInDays(effectiveStartDate, start);
      const left = startOffset * dayWidth;
      
      // Calculate width
      const duration = differenceInDays(effectiveEndDate, effectiveStartDate) + 1; // +1 to include both start and end days
      const width = duration * dayWidth;
      
      return {
        left: `${left}px`,
        width: `${width}px`,
        position: 'absolute' as const,
        height: '80px'
      };
    }
    
    // For year view
    else {
      // Check if the item overlaps with the current year
      const yearStart = new Date(currentDate.getFullYear(), 0, 1);
      const yearEnd = new Date(currentDate.getFullYear(), 11, 31);
      
      // If item is not in this year at all, don't display
      if (item.endDate < yearStart || item.startDate > yearEnd) {
        return { display: 'none' };
      }
      
      // Calculate months as a percentage of the year
      const effectiveStartDate = item.startDate < yearStart ? yearStart : item.startDate;
      const effectiveEndDate = item.endDate > yearEnd ? yearEnd : item.endDate;
      
      // Get start month percentage (0-11)
      const startMonth = effectiveStartDate.getMonth();
      const startDay = effectiveStartDate.getDate();
      const daysInStartMonth = new Date(effectiveStartDate.getFullYear(), startMonth + 1, 0).getDate();
      const startPercentage = (startMonth + (startDay - 1) / daysInStartMonth) / 12;
      
      // Get end month percentage (0-11)
      const endMonth = effectiveEndDate.getMonth();
      const endDay = effectiveEndDate.getDate();
      const daysInEndMonth = new Date(effectiveEndDate.getFullYear(), endMonth + 1, 0).getDate();
      const endPercentage = (endMonth + endDay / daysInEndMonth) / 12;
      
      // Calculate position and width
      const left = startPercentage * containerWidth;
      const width = (endPercentage - startPercentage) * containerWidth;
      
      return {
        left: `${left}px`,
        width: `${width}px`,
        position: 'absolute' as const,
        height: '80px'
      };
    }
  };
  
  return (
    <div className="flex flex-col h-full border rounded-lg bg-background shadow-md">
      {/* Header with controls */}
      <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-lg font-medium">
            {view === "month" 
              ? format(currentDate, "MMMM yyyy") 
              : format(currentDate, "yyyy")}
          </h2>
          
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Tabs 
            value={view} 
            onValueChange={(v) => setView(v as TimelineView)}
            className="mr-4"
          >
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Parent Goal:</span>
            <Select 
              value={selectedParentGoalId || ''} 
              onValueChange={setSelectedParentGoalId}
              disabled={isLoading || parentGoals.length === 0}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {parentGoals.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Timeline content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="relative p-4" ref={timelineRef}>
            {/* Month view */}
            {view === "month" && (
              <div className="space-y-6">
                {/* Day headers */}
                <div className="grid grid-cols-[repeat(var(--days-count),minmax(100px,1fr))]" style={{ '--days-count': getDaysInMonth().length } as React.CSSProperties}>
                  {getDaysInMonth().map((day, i) => (
                    <div 
                      key={i} 
                      className="text-center p-2 border-r last:border-r-0 border-b text-sm font-medium"
                      onClick={() => handleCreateSubGoal(day)}
                    >
                      <div>{format(day, "d")}</div>
                      <div className="text-xs text-muted-foreground">{format(day, "E")}</div>
                    </div>
                  ))}
                </div>
                
                {/* Timeline items container */}
                <div 
                  className="relative border-l border-r min-h-[300px]" 
                  style={{ 
                    width: `${getDaysInMonth().length * 100}px`, 
                    height: `${timelineItems.length === 0 ? 200 : timelineItems.length * 100 + 50}px` 
                  }}
                >
                  {/* Render day columns */}
                  {getDaysInMonth().map((day, i) => (
                    <div 
                      key={i}
                      className="absolute border-r border-muted h-full hover:bg-muted/10 transition-colors cursor-pointer"
                      style={{ 
                        left: `${i * 100}px`, 
                        width: '100px',
                        top: 0 
                      }}
                      onClick={() => handleCreateSubGoal(day)}
                    ></div>
                  ))}
                  
                  {/* Render timeline items */}
                  {timelineItems.map((item, i) => (
                    <TimelineSubGoalCard
                      key={item.id || i}
                      item={item}
                      style={calculateItemStyle(item, getDaysInMonth().length * 100, getDaysInMonth())}
                      onClick={() => handleEditItem(item)}
                      onResize={handleItemResize}
                      index={i}
                    />
                  ))}
                  
                  {/* Empty state */}
                  {timelineItems.length === 0 && selectedParentGoalId && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Calendar className="mx-auto h-12 w-12 opacity-20" />
                        <p className="mt-2">No sub-goals found. Click on a day to create one.</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Loading state */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Year view */}
            {view === "year" && (
              <div className="space-y-6">
                {/* Month headers */}
                <div className="grid grid-cols-12">
                  {getMonthsInYear().map((month, i) => (
                    <div 
                      key={i} 
                      className="text-center p-2 border-r last:border-r-0 border-b text-sm font-medium"
                      onClick={() => handleCreateSubGoal(month)}
                    >
                      {format(month, "MMM")}
                    </div>
                  ))}
                </div>
                
                {/* Timeline items container */}
                <div 
                  className="relative border-l border-r min-h-[300px]" 
                  style={{ 
                    height: `${timelineItems.length === 0 ? 200 : timelineItems.length * 100 + 50}px` 
                  }}
                >
                  {/* Render month columns */}
                  {getMonthsInYear().map((month, i) => (
                    <div 
                      key={i}
                      className="absolute border-r border-muted h-full hover:bg-muted/10 transition-colors cursor-pointer"
                      style={{ 
                        left: `${i * (100/12)}%`, 
                        width: `${100/12}%`,
                        top: 0 
                      }}
                      onClick={() => handleCreateSubGoal(month)}
                    ></div>
                  ))}
                  
                  {/* Render timeline items */}
                  {timelineItems.map((item, i) => (
                    <TimelineSubGoalCard
                      key={item.id || i}
                      item={item}
                      style={calculateItemStyle(item, timelineRef.current?.clientWidth || 1200, [])}
                      onClick={() => handleEditItem(item)}
                      onResize={handleItemResize}
                      index={i}
                    />
                  ))}
                  
                  {/* Empty state */}
                  {timelineItems.length === 0 && selectedParentGoalId && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Calendar className="mx-auto h-12 w-12 opacity-20" />
                        <p className="mt-2">No sub-goals found. Click on a month to create one.</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Loading state */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Edit/Create Dialog */}
      <TimelineSubGoalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={editItem}
        onSave={handleUpdateItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};

export default RoadmapTimeline;
