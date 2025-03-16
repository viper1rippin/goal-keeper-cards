
import { supabase } from '@/integrations/supabase/client';

export async function migrateGoalsToUser(email: string = 'thawlinoo2021@gmail.com') {
  try {
    // First, check if there are any goals without user_id
    const { data: goalsWithoutUser, error: fetchError } = await supabase
      .from('parent_goals')
      .select('id')
      .is('user_id', null);
    
    if (fetchError) {
      throw fetchError;
    }
    
    // If there are goals without user_id, update them
    if (goalsWithoutUser && goalsWithoutUser.length > 0) {
      const goalIds = goalsWithoutUser.map(goal => goal.id);
      
      // Update all goals without user_id to belong to the specified user
      const { error: updateError } = await supabase
        .from('parent_goals')
        .update({ user_id: email })
        .in('id', goalIds);
      
      if (updateError) {
        throw updateError;
      }
      
      console.log(`Successfully migrated ${goalIds.length} goals to user ${email}`);
      return {
        success: true,
        message: `Successfully migrated ${goalIds.length} goals to user ${email}`
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
