
export type TimelineViewMode = "month" | "year";

export type TimelineCategory = 
  | "milestone"
  | "feature"
  | "research"
  | "design"
  | "development"
  | "testing"
  | "marketing"
  | "mobile"
  | "web"
  | "infrastructure"
  | "backend"
  | "default";

export interface SubGoalTimelineItem {
  id: string;
  title: string;
  description: string;
  row: number; // Vertical position in timeline
  start: number; // Starting position (day/week/month)
  duration: number; // Length in time units
  progress: number; // 0-100
  parentId?: string; // Reference to parent goal
  originalSubGoalId?: string; // If imported from a sub-goal
  startDate?: string; // New field for start date
  endDate?: string; // New field for end date
  category?: TimelineCategory; // Category for visual styling
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
