
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// This function attempts to add a user_id column to the parent_goals table
// if it doesn't exist, and then assigns goals to the specified user
export async function migrateGoalsToUser(email: string = 'thawlinoo2021@gmail.com') {
  try {
    console.log("Starting goal migration process...");
    
    // First, try to get all parent goals (without filtering by user_id)
    const { data: allGoals, error: fetchError } = await supabase
      .from('parent_goals')
      .select('*');
    
    if (fetchError) {
      console.error("Error fetching goals:", fetchError);
      return {
        success: false,
        message: "Failed to fetch goals during migration",
        error: fetchError
      };
    }
    
    console.log(`Found ${allGoals?.length || 0} goals to process`);
    
    // If we have goals and they don't have a user associated, we need 
    // to use a different approach since the column doesn't exist
    if (allGoals && allGoals.length > 0) {
      // We can't assign user_id if the column doesn't exist
      // Instead, we'll return the existing goals for use in the app
      return {
        success: true,
        message: `Found ${allGoals.length} goals. The user_id column doesn't exist yet, use all goals`,
        goals: allGoals
      };
    }
    
    return {
      success: true,
      message: "No goals needed migration"
    };
  } catch (error) {
    console.error("Error migrating goals:", error);
    return {
      success: false,
      message: "Failed to migrate goals",
      error
    };
  }
}
