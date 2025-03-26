
export type TimelineViewMode = "month" | "year";

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
  startDate?: string; // For start date
  endDate?: string; // For end date
  color?: string; // Add color property for consistency with home page
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
