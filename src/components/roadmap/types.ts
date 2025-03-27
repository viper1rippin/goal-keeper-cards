
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
  progress: number;
  row: number;
  start: number;
  duration: number;
  category: TimelineCategory;
  parentId?: string;
  originalSubGoalId?: string;
  startDate?: string;
  endDate?: string;
  color?: string; // Added color property for consistent syncing
}
