
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// This function fetches all goals since the user_id column doesn't exist
export async function migrateGoalsToUser(email: string = 'thawlinoo2021@gmail.com') {
  try {
    console.log("Starting goal migration process...");
    
    // Get all goals without filtering by user_id (since the column doesn't exist)
    const { data: allGoals, error: fetchError } = await supabase
      .from('parent_goals')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error("Error fetching goals:", fetchError);
      return {
        success: false,
        message: "Failed to fetch goals during migration",
        error: fetchError
      };
    }
    
    console.log(`Found ${allGoals?.length || 0} goals to process`);
    
    if (allGoals && allGoals.length > 0) {
      return {
        success: true,
        message: `Found ${allGoals.length} goals.`,
        goals: allGoals
      };
    }
    
    return {
      success: true,
      message: "No goals found"
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
