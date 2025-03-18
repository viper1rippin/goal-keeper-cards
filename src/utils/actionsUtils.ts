
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export interface Action {
  id?: string;
  content: string;
  position_x: number;
  position_y: number;
  project_id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Local storage key for actions
const LOCAL_STORAGE_KEY = 'zodiac_actions';

// Helper function to generate UUID for local storage
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const actionsService = {
  // Check if actions table exists
  async checkTableExists(): Promise<boolean> {
    try {
      // Call the database function to check if the table exists
      const { data, error } = await supabase.rpc('check_table_exists', {
        check_name: 'actions'
      });
      
      if (error) {
        console.error("Error checking if table exists:", error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error("Error checking if table exists:", error);
      return false;
    }
  },

  // Get actions for a project
  async getActionsForProject(projectId: string, userId: string): Promise<Action[]> {
    try {
      // Check if table exists first
      const tableExists = await this.checkTableExists();
      
      if (!tableExists) {
        console.info("Table 'actions' doesn't exist. Using local storage only.");
        // Fallback to local storage
        return this._getActionsFromLocalStorage(projectId, userId);
      }
      
      // Fetch from database using RPC function
      const { data, error } = await supabase.rpc('get_actions_for_project', {
        p_project_id: projectId,
        p_user_id: userId
      });
      
      if (error) {
        console.error("Error getting actions:", error);
        throw error;
      }
      
      return (data as Action[]) || [];
    } catch (error) {
      console.error("Error getting actions:", error);
      // Fallback to local storage on error
      return this._getActionsFromLocalStorage(projectId, userId);
    }
  },

  // Create a new action
  async createAction(action: Action): Promise<Action> {
    try {
      if (!action.user_id) {
        throw new Error("User ID is required");
      }
      
      // Check if table exists first
      const tableExists = await this.checkTableExists();
      
      if (!tableExists) {
        console.info("Table 'actions' doesn't exist. Using local storage only.");
        // Fallback to local storage
        return this._createActionInLocalStorage(action);
      }
      
      // Insert into database using RPC function
      const { data, error } = await supabase.rpc('create_action', {
        p_content: action.content,
        p_position_x: action.position_x,
        p_position_y: action.position_y,
        p_project_id: action.project_id,
        p_user_id: action.user_id
      });
      
      if (error) {
        console.error("Error creating action:", error);
        throw error;
      }
      
      return data as Action;
    } catch (error) {
      console.error("Error creating action:", error);
      // Fallback to local storage on error
      if (action.user_id) {
        return this._createActionInLocalStorage(action);
      }
      throw error;
    }
  },

  // Update an action
  async updateAction(action: Action): Promise<void> {
    try {
      if (!action.id || !action.user_id) {
        throw new Error("Action ID and User ID are required");
      }
      
      // Check if table exists first
      const tableExists = await this.checkTableExists();
      
      if (!tableExists || action.id.startsWith('local-')) {
        console.info("Table 'actions' doesn't exist or this is a local action. Using local storage only.");
        // Fallback to local storage
        this._updateActionInLocalStorage(action);
        return;
      }
      
      // Update in database using RPC function
      const { error } = await supabase.rpc('update_action', {
        p_id: action.id,
        p_user_id: action.user_id,
        p_content: action.content,
        p_position_x: action.position_x,
        p_position_y: action.position_y
      });
      
      if (error) {
        console.error("Error updating action:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error updating action:", error);
      // Fallback to local storage on error
      this._updateActionInLocalStorage(action);
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
      // Check if table exists first
      const tableExists = await this.checkTableExists();
      
      if (!tableExists || id.startsWith('local-')) {
        console.info("Table 'actions' doesn't exist or this is a local action. Using local storage only.");
        // Fallback to local storage
        this._updateActionPositionInLocalStorage(id, userId, position_x, position_y);
        return;
      }
      
      // Update position in database using RPC function
      const { error } = await supabase.rpc('update_action_position', {
        p_id: id,
        p_user_id: userId,
        p_position_x: position_x,
        p_position_y: position_y
      });
      
      if (error) {
        console.error("Error updating action position:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error updating action position:", error);
      // Fallback to local storage on error
      this._updateActionPositionInLocalStorage(id, userId, position_x, position_y);
    }
  },

  // Delete an action
  async deleteAction(id: string, userId: string): Promise<void> {
    try {
      // Check if table exists first
      const tableExists = await this.checkTableExists();
      
      if (!tableExists || id.startsWith('local-')) {
        console.info("Table 'actions' doesn't exist or this is a local action. Using local storage only.");
        // Fallback to local storage
        this._deleteActionFromLocalStorage(id, userId);
        return;
      }
      
      // Delete from database using RPC function
      const { error } = await supabase.rpc('delete_action', {
        p_id: id,
        p_user_id: userId
      });
      
      if (error) {
        console.error("Error deleting action:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error deleting action:", error);
      // Fallback to local storage on error
      this._deleteActionFromLocalStorage(id, userId);
    }
  },

  // Local storage methods
  _getActionsFromLocalStorage(projectId: string, userId: string): Action[] {
    try {
      const storedActions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedActions) return [];
      
      const allActions = JSON.parse(storedActions) as Action[];
      return allActions.filter(a => a.project_id === projectId && a.user_id === userId);
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  },

  _createActionInLocalStorage(action: Action): Action {
    try {
      const storedActions = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allActions = storedActions ? JSON.parse(storedActions) as Action[] : [];
      
      // Generate an ID if one isn't provided
      const newAction = {
        ...action,
        id: action.id || `local-${generateUUID()}`,
        created_at: action.created_at || new Date().toISOString()
      };
      
      allActions.push(newAction);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allActions));
      
      return newAction;
    } catch (error) {
      console.error("Error writing to localStorage:", error);
      throw error;
    }
  },

  _updateActionInLocalStorage(action: Action): void {
    try {
      const storedActions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedActions) return;
      
      const allActions = JSON.parse(storedActions) as Action[];
      const index = allActions.findIndex(a => a.id === action.id && a.user_id === action.user_id);
      
      if (index !== -1) {
        allActions[index] = {
          ...allActions[index],
          ...action,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allActions));
      }
    } catch (error) {
      console.error("Error updating in localStorage:", error);
    }
  },

  _updateActionPositionInLocalStorage(id: string, userId: string, position_x: number, position_y: number): void {
    try {
      const storedActions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedActions) return;
      
      const allActions = JSON.parse(storedActions) as Action[];
      const index = allActions.findIndex(a => a.id === id && a.user_id === userId);
      
      if (index !== -1) {
        allActions[index].position_x = position_x;
        allActions[index].position_y = position_y;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allActions));
      }
    } catch (error) {
      console.error("Error updating position in localStorage:", error);
    }
  },

  _deleteActionFromLocalStorage(id: string, userId: string): void {
    try {
      const storedActions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedActions) return;
      
      const allActions = JSON.parse(storedActions) as Action[];
      const filteredActions = allActions.filter(a => !(a.id === id && a.user_id === userId));
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredActions));
    } catch (error) {
      console.error("Error deleting from localStorage:", error);
    }
  },
  
  // Migrate local storage data to database
  async migrateLocalStorageToDatabase(userId: string): Promise<void> {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        console.info("Table 'actions' doesn't exist. Cannot migrate data.");
        return;
      }
      
      const storedActions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedActions) return;
      
      const allActions = JSON.parse(storedActions) as Action[];
      const userActions = allActions.filter(a => a.user_id === userId);
      
      if (userActions.length === 0) return;
      
      // Insert all user actions from localStorage to database
      for (const action of userActions) {
        try {
          // Skip actions that already have IDs starting with 'local-'
          if (action.id && action.id.startsWith('local-')) {
            // Create a new action without the 'local-' ID
            await supabase.rpc('create_action', {
              p_content: action.content,
              p_position_x: action.position_x,
              p_position_y: action.position_y,
              p_project_id: action.project_id,
              p_user_id: userId
            });
          } else {
            // Check if action already exists in database
            const { data: existingAction } = await supabase
              .from('actions')
              .select('id')
              .eq('id', action.id)
              .eq('user_id', userId)
              .single();
            
            if (!existingAction) {
              // Insert action if it doesn't exist
              await supabase.rpc('create_action', {
                p_content: action.content,
                p_position_x: action.position_x,
                p_position_y: action.position_y,
                p_project_id: action.project_id,
                p_user_id: userId
              });
            }
          }
        } catch (error) {
          console.error("Error migrating action:", error);
          // Continue with next action
        }
      }
      
      // Remove migrated actions from localStorage
      const remainingActions = allActions.filter(a => a.user_id !== userId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remainingActions));
      
      console.log(`Successfully migrated ${userActions.length} actions to database.`);
    } catch (error) {
      console.error("Error migrating actions to database:", error);
    }
  }
};
