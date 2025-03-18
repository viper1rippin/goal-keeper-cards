
import { Goal } from "@/components/GoalRow";

// Type for parent goal from Supabase, avoiding deep nesting
export interface ParentGoalData {
  id: string;
  title: string;
  description: string;
  position: number | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

// Type for sub goal from Supabase
export interface SubGoalData {
  id: string;
  title: string;
  description: string;
  progress: number;
  parent_goal_id: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

// Mapped parent goal with goals
export interface MappedParentGoal {
  id: string;
  title: string;
  description: string;
  position: number;
  goals: Goal[];
  user_id?: string;
}
