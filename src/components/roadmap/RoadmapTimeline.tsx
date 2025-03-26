
import React, { useState, useRef, useEffect } from "react";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isToday, addYears, subYears, differenceInDays, parseISO, getYear } from "date-fns";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TimelineSubGoalCard from "./TimelineSubGoalCard";
import TimelineSubGoalDialog from "./TimelineSubGoalDialog";
import { Goal } from "@/components/GoalRow";

// Define timeline views
type TimelineView = "month" | "year" | "week" | "day";

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
  const [view, setView] = useState<TimelineView>("year");
  const [selectedParentGoalId, setSelectedParentGoalId] = useState<string | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [editItem, setEditItem] = useState<TimelineItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startDragX, setStartDragX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const timelineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
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
  
  // Mouse events for horizontal dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (contentRef.current) {
      setIsDragging(true);
      setStartDragX(e.clientX);
      setScrollStart(contentRef.current.scrollLeft);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && contentRef.current) {
      const distance = e.clientX - startDragX;
      contentRef.current.scrollLeft = scrollStart - distance;
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Handle scroll with wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (contentRef.current) {
      e.preventDefault();
      // Use deltaY for vertical scroll to move horizontally for better UX
      contentRef.current.scrollLeft += e.deltaY;
    }
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
    endDate.setDate(endDate.getDate() + 20); // Default to 20-day duration
    
    const newItem: TimelineItem = {
      id: "", // Will be assigned by database
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
  
  // Helper function to generate months for year view
  const getMonthsInYear = () => {
    const months = [];
    const startYear = getYear(currentDate) - 1;
    const endYear = getYear(currentDate) + 1;
    
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        months.push(new Date(year, month, 1));
      }
    }
    
    return months;
  };
  
  // Helper function to generate days for month view
  const getDaysInMonth = () => {
    // Generate dates for previous, current and next month
    const prevMonthDates = eachDayOfInterval({
      start: startOfMonth(subMonths(currentDate, 1)),
      end: endOfMonth(subMonths(currentDate, 1))
    });
    
    const currentMonthDates = eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    });
    
    const nextMonthDates = eachDayOfInterval({
      start: startOfMonth(addMonths(currentDate, 1)),
      end: endOfMonth(addMonths(currentDate, 1))
    });
    
    return [...prevMonthDates, ...currentMonthDates, ...nextMonthDates];
  };
  
  // Calculate position and width for timeline items
  const calculateItemStyle = (item: TimelineItem) => {
    if (!item.startDate || !item.endDate) return { display: 'none' };
    
    const containerWidth = contentRef.current?.clientWidth || 1200;
    
    // For month view
    if (view === "month") {
      const days = getDaysInMonth();
      const totalDays = days.length;
      const dayWidth = containerWidth / totalDays;
      
      // Calculate the item's position
      const startDay = days.findIndex(d => 
        format(d, 'yyyy-MM-dd') === format(item.startDate, 'yyyy-MM-dd')
      );
      
      if (startDay === -1) return { display: 'none' };
      
      const endDay = days.findIndex(d => 
        format(d, 'yyyy-MM-dd') === format(item.endDate, 'yyyy-MM-dd')
      );
      
      const duration = (endDay !== -1 ? endDay : days.length - 1) - startDay + 1;
      const left = startDay * dayWidth;
      const width = duration * dayWidth;
      
      return {
        left: `${left}px`,
        width: `${width}px`,
        position: 'absolute' as const,
        height: '80px'
      };
    }
    
    // For year view
    else if (view === "year") {
      const months = getMonthsInYear();
      const totalMonths = months.length;
      const monthWidth = containerWidth / 12; // Show 12 months at a time
      
      // Get start and end month indices
      const startMonthIndex = months.findIndex(m => 
        m.getFullYear() === item.startDate.getFullYear() && 
        m.getMonth() === item.startDate.getMonth()
      );
      
      if (startMonthIndex === -1) return { display: 'none' };
      
      const endMonthIndex = months.findIndex(m => 
        m.getFullYear() === item.endDate.getFullYear() && 
        m.getMonth() === item.endDate.getMonth()
      );
      
      // Calculate position
      const startMonthOffset = startMonthIndex - 12; // Adjust for initial scroll position
      const endMonthOffset = (endMonthIndex !== -1 ? endMonthIndex : startMonthIndex) - 12;
      
      const left = startMonthOffset * monthWidth;
      const width = (endMonthOffset - startMonthOffset + 1) * monthWidth;
      
      return {
        left: `${left}px`,
        width: `${width}px`,
        position: 'absolute' as const,
        height: '80px'
      };
    }
    
    return { display: 'none' };
  };
  
  // Set initial scroll position
  useEffect(() => {
    if (contentRef.current) {
      // For year view, scroll to current year
      if (view === "year") {
        contentRef.current.scrollLeft = (12 * contentRef.current.clientWidth) / 12;
      }
      // For month view, scroll to show current month
      else if (view === "month") {
        const daysBeforeCurrentMonth = getDaysInMonth().findIndex(day => 
          format(day, 'yyyy-MM') === format(currentDate, 'yyyy-MM')
        );
        
        if (daysBeforeCurrentMonth > 0) {
          const dayWidth = contentRef.current.clientWidth / getDaysInMonth().length;
          contentRef.current.scrollLeft = daysBeforeCurrentMonth * dayWidth;
        }
      }
    }
  }, [view, timelineItems]);
  
  return (
    <div className="flex flex-col h-full border rounded-lg bg-black/90 shadow-md overflow-hidden">
      {/* Header with controls */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-medium text-white">Roadmap:</span>
          <Select 
            value={selectedParentGoalId || ''} 
            onValueChange={setSelectedParentGoalId}
            disabled={isLoading || parentGoals.length === 0}
          >
            <SelectTrigger className="w-[220px] border-gray-700 bg-gray-900">
              <SelectValue placeholder="Select a goal" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {parentGoals.map(goal => (
                <SelectItem key={goal.id} value={goal.id}>
                  {goal.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-1 bg-gray-800 rounded-md p-1">
          <Button
            variant={view === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("day")}
            className={view === "day" ? "bg-gray-700" : "text-gray-400"}
          >
            Day
          </Button>
          <Button
            variant={view === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("week")}
            className={view === "week" ? "bg-gray-700" : "text-gray-400"}
          >
            Week
          </Button>
          <Button
            variant={view === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("month")}
            className={view === "month" ? "bg-gray-700" : "text-gray-400"}
          >
            Month
          </Button>
          <Button
            variant={view === "year" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("year")}
            className={view === "year" ? "bg-gray-700" : "text-gray-400"}
          >
            Year
          </Button>
        </div>
      </div>
      
      {/* Timeline content */}
      <div className="flex-1 overflow-hidden">
        <div
          className="relative h-full"
          ref={timelineRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Year view */}
          {view === "year" && (
            <div className="h-full flex flex-col">
              {/* Month headers */}
              <div className="bg-gray-800/60 sticky top-0 z-10 grid grid-cols-12 border-b border-gray-700">
                {getMonthsInYear().slice(12, 24).map((month, i) => (
                  <div 
                    key={i} 
                    className={`
                      text-center p-2 text-sm font-medium text-gray-200 border-r
                      border-gray-700 last:border-r-0
                      ${month.getMonth() === new Date().getMonth() && month.getFullYear() === new Date().getFullYear() ? 'bg-gray-700/50' : ''}
                    `}
                  >
                    {format(month, "MMM")}
                  </div>
                ))}
              </div>
              
              {/* Timeline content */}
              <div 
                ref={contentRef}
                className="flex-1 relative overflow-x-auto"
                style={{ overscrollBehavior: 'none' }}
              >
                {/* Month blocks */}
                <div 
                  className="grid grid-cols-36 absolute min-h-[600px] top-0 left-0 right-0 bottom-0"
                  style={{ width: `${getMonthsInYear().length * 100}px` }}
                >
                  {getMonthsInYear().map((month, i) => (
                    <div 
                      key={i}
                      className="border-r border-b border-gray-800 relative h-full"
                      onClick={() => handleCreateSubGoal(month)}
                    >
                      {/* Month grid column */}
                    </div>
                  ))}
                </div>
                
                {/* Timeline items */}
                <div className="absolute top-0 left-0 right-0 bottom-0">
                  {/* The first row is for headers, then we place items on rows 1, 2, 3, etc. */}
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <div 
                      key={rowIndex} 
                      className="relative h-[95px] pt-4 border-b border-gray-800 overflow-visible"
                    >
                      {timelineItems
                        .filter((_, itemIndex) => itemIndex % 5 === rowIndex)
                        .map((item, i) => (
                          <TimelineSubGoalCard
                            key={item.id || i}
                            item={item}
                            style={calculateItemStyle(item)}
                            onClick={() => { 
                              setEditItem(item);
                              setIsDialogOpen(true);
                            }}
                            onResize={handleItemResize}
                            index={i}
                          />
                        ))}
                    </div>
                  ))}
                </div>
                
                {/* Empty state */}
                {timelineItems.length === 0 && selectedParentGoalId && !isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <p className="mt-2">No sub-goals found. Click anywhere on the timeline to create one.</p>
                    </div>
                  </div>
                )}
                
                {/* Loading state */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-gray-400">Loading...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Month view */}
          {view === "month" && (
            <div className="h-full flex flex-col">
              {/* Day headers */}
              <div className="bg-gray-800/60 sticky top-0 z-10 grid grid-cols-31 border-b border-gray-700">
                {getDaysInMonth().map((day, i) => (
                  <div 
                    key={i} 
                    className={`
                      text-center p-2 text-sm flex flex-col items-center
                      border-r border-gray-700 last:border-r-0
                      ${isToday(day) ? 'bg-gray-700/50' : ''}
                    `}
                  >
                    <div className="font-medium text-gray-200">{format(day, "d")}</div>
                    <div className="text-xs text-gray-400">{format(day, "E")}</div>
                  </div>
                ))}
              </div>
              
              {/* Timeline content */}
              <div 
                ref={contentRef}
                className="flex-1 relative overflow-x-auto"
                style={{ overscrollBehavior: 'none' }}
              >
                {/* Day blocks */}
                <div 
                  className="grid grid-cols-93 absolute min-h-[600px] top-0 left-0 right-0 bottom-0"
                  style={{ width: `${getDaysInMonth().length * 100}px` }}
                >
                  {getDaysInMonth().map((day, i) => (
                    <div 
                      key={i}
                      className="border-r border-b border-gray-800 relative h-full"
                      onClick={() => handleCreateSubGoal(day)}
                    >
                      {/* Day grid column */}
                    </div>
                  ))}
                </div>
                
                {/* Timeline items */}
                <div className="absolute top-0 left-0 right-0 bottom-0">
                  {/* The first row is for headers, then we place items on rows 1, 2, 3, etc. */}
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <div 
                      key={rowIndex} 
                      className="relative h-[95px] pt-4 border-b border-gray-800 overflow-visible"
                    >
                      {timelineItems
                        .filter((_, itemIndex) => itemIndex % 5 === rowIndex)
                        .map((item, i) => (
                          <TimelineSubGoalCard
                            key={item.id || i}
                            item={item}
                            style={calculateItemStyle(item)}
                            onClick={() => { 
                              setEditItem(item);
                              setIsDialogOpen(true);
                            }}
                            onResize={handleItemResize}
                            index={i}
                          />
                        ))}
                    </div>
                  ))}
                </div>
                
                {/* Empty state */}
                {timelineItems.length === 0 && selectedParentGoalId && !isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <p className="mt-2">No sub-goals found. Click anywhere on the timeline to create one.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Add Button */}
        <Button 
          size="icon"
          className="absolute bottom-4 right-4 rounded-full h-12 w-12 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
          onClick={() => handleCreateSubGoal(new Date())}
        >
          <Plus className="h-6 w-6" />
        </Button>
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
