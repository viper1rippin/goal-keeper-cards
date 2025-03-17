
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

export interface Action {
  id?: string;
  content: string;
  position_x: number;
  position_y: number;
  project_id: string;
  user_id?: string;
  created_at?: string;
}

export const actionsService = {
  // Check if actions table exists
  async checkTableExists(): Promise<boolean> {
    try {
      // Use a raw query to check if the table exists
      const { data, error } = await supabase.rpc(
        'check_table_exists',
        { table_name: 'actions' }
      );
      
      if (error) {
        console.error("Error checking if table exists:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Error in checkTableExists:", error);
      return false;
    }
  },

  // Get actions for a project
  async getActionsForProject(projectId: string, userId: string): Promise<Action[]> {
    try {
      // Use raw query to avoid type issues
      const { data, error } = await supabase.rpc(
        'get_actions_for_project',
        { 
          p_project_id: projectId,
          p_user_id: userId
        }
      );
      
      if (error) throw error;
      
      return data as Action[] || [];
    } catch (error) {
      console.error("Error getting actions:", error);
      throw error;
    }
  },

  // Create a new action
  async createAction(action: Action): Promise<Action> {
    try {
      if (!action.user_id) {
        throw new Error("User ID is required");
      }

      const { data, error } = await supabase.rpc(
        'create_action',
        {
          p_content: action.content,
          p_position_x: action.position_x,
          p_position_y: action.position_y,
          p_project_id: action.project_id,
          p_user_id: action.user_id
        }
      );
      
      if (error) throw error;
      
      return data as Action;
    } catch (error) {
      console.error("Error creating action:", error);
      throw error;
    }
  },

  // Update an action
  async updateAction(action: Action): Promise<void> {
    try {
      if (!action.id || !action.user_id) {
        throw new Error("Action ID and User ID are required");
      }

      const { error } = await supabase.rpc(
        'update_action',
        {
          p_id: action.id,
          p_user_id: action.user_id,
          p_content: action.content,
          p_position_x: action.position_x,
          p_position_y: action.position_y
        }
      );
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating action:", error);
      throw error;
    }
  },

  // Update an action's position
  async updateActionPosition(
    id: string, 
    userId: string,
    position_x: number, 
    position_y: number
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc(
        'update_action_position',
        {
          p_id: id,
          p_user_id: userId,
          p_position_x: position_x,
          p_position_y: position_y
        }
      );
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating action position:", error);
      throw error;
    }
  },

  // Delete an action
  async deleteAction(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc(
        'delete_action',
        {
          p_id: id,
          p_user_id: userId
        }
      );
      
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting action:", error);
      throw error;
    }
  }
};
