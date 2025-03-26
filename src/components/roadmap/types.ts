
export type TimelineViewMode = "day" | "week" | "month" | "year";

export type TimelineCategory = 
  | "research" 
  | "design" 
  | "development" 
  | "testing" 
  | "marketing"
  | "feature"
  | "milestone" 
  | "default"
  | "mobile"
  | "web"
  | "infrastructure"
  | "backend";

export interface SubGoalTimelineItem {
  id: string;
  title: string;
  description: string;
  row: number; // Vertical position in timeline
  start: number; // Starting position (day/week/month)
  duration: number; // Length in time units
  progress: number; // 0-100
  category?: TimelineCategory;
  parentId?: string; // Reference to parent goal
  originalSubGoalId?: string; // If imported from a sub-goal
  date?: Date; // Actual calendar date for the item
  endDate?: Date; // End date for the item
}

export interface TimelineViewport {
  startUnit: number;
  endUnit: number;
  viewMode: TimelineViewMode;
  startDate?: Date;
  endDate?: Date;
}

export interface RoadmapData {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  items: SubGoalTimelineItem[];
  created_at?: string;
  updated_at?: string;
}
