
/**
 * Base types for goals with essential properties
 */
export interface BaseGoal {
  id?: string;
  title: string;
  description: string;
}

/**
 * Extended type for SubGoal with additional progress property
 */
export interface SubGoal extends BaseGoal {
  progress: number;
  parent_goal_id?: string;
}

/**
 * Extended type for ParentGoal with position and subgoals
 */
export interface ParentGoal extends BaseGoal {
  position?: number;
  goals: SubGoal[];
}

/**
 * Simple data transfer type for SubGoal operations
 * Prevents excessive type nesting in forms and state
 */
export interface SubGoalData {
  id?: string;
  title: string;
  description: string;
  progress?: number;
  parent_goal_id?: string;
}

/**
 * Type for form values - keeps form submission simple
 */
export interface SubGoalFormValues {
  title: string;
  description: string;
}
