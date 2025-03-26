
export type TimelineViewMode = "day" | "week" | "month" | "year";

export type TimelineCategory = 
  | "default"
  | "milestone" 
  | "feature" 
  | "research" 
  | "design" 
  | "development" 
  | "testing" 
  | "marketing";

export interface SubGoalTimelineItem {
  id: string;
  title: string;
  description: string;
  progress: number;
  row: number;
  start: number;
  duration: number;
  category: TimelineCategory;
}

export interface RoadmapData {
  id: string;
  title: string;
  user_id: string;
  items: SubGoalTimelineItem[];
}
