
export interface SubGoalTimelineItem {
  id: string;
  title: string;
  description: string;
  progress: number;
  row: number;
  start: number; // Month index (0-11)
  duration: number; // Length in months
  category?: 'milestone' | 'feature' | 'mobile' | 'web' | 'infrastructure' | 'backend' | 'default';
  parentId?: string;
  originalSubGoalId?: string;
}

export interface RoadmapData {
  id: string;
  title: string;
  description: string;
  user_id: string;
  items: SubGoalTimelineItem[];
  created_at?: string;
  updated_at?: string;
}
