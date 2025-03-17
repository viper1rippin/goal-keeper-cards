
import { supabase } from "@/integrations/supabase/client";

export interface Action {
  id?: string;
  content: string;
  position_x: number;
  position_y: number;
  project_id: string;
  user_id?: string;
  created_at?: string;
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
      // Use a simple select query to check if the table exists
      const { data, error } = await supabase
        .from('actions')
        .select('id')
        .limit(1)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist
        return false;
      }
      
      // Table exists, even if empty
      return true;
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
      
      // Fetch from database using standard query
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return data as Action[] || [];
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
      
      // Insert into database
      const { data, error } = await supabase
        .from('actions')
        .insert({
          content: action.content,
          position_x: action.position_x,
          position_y: action.position_y,
          project_id: action.project_id,
          user_id: action.user_id
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
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
      
      if (!tableExists) {
        console.info("Table 'actions' doesn't exist. Using local storage only.");
        // Fallback to local storage
        this._updateActionInLocalStorage(action);
        return;
      }
      
      // Update in database
      const { error } = await supabase
        .from('actions')
        .update({
          content: action.content,
          position_x: action.position_x,
          position_y: action.position_y
        })
        .eq('id', action.id)
        .eq('user_id', action.user_id);
      
      if (error) throw error;
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
      
      if (!tableExists) {
        console.info("Table 'actions' doesn't exist. Using local storage only.");
        // Fallback to local storage
        this._updateActionPositionInLocalStorage(id, userId, position_x, position_y);
        return;
      }
      
      // Update position in database
      const { error } = await supabase
        .from('actions')
        .update({
          position_x,
          position_y
        })
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
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
      
      if (!tableExists) {
        console.info("Table 'actions' doesn't exist. Using local storage only.");
        // Fallback to local storage
        this._deleteActionFromLocalStorage(id, userId);
        return;
      }
      
      // Delete from database
      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
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
        id: action.id || generateUUID(),
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
  }
};
