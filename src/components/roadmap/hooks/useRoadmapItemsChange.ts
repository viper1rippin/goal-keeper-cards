
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SubGoalTimelineItem } from '@/components/roadmap/types';

export const useRoadmapItemsChange = () => {
  const { user } = useAuth();

  const handleItemsChange = async (
    updatedItems: SubGoalTimelineItem[], 
    roadmapItems: SubGoalTimelineItem[], 
    selectedRoadmapId: string | null
  ) => {
    if (user && selectedRoadmapId) {
      for (const item of updatedItems) {
        try {
          if (item.originalSubGoalId) {
            await supabase
              .from('sub_goals')
              .update({
                progress: item.progress,
                title: item.title,
                description: item.description,
                timeline_row: item.row,
                timeline_start: item.start,
                timeline_duration: item.duration,
                start_date: item.startDate,
                end_date: item.endDate
              })
              .eq('id', item.originalSubGoalId)
              .eq('user_id', user.id);
          } else {
            const { data, error } = await supabase
              .from('sub_goals')
              .insert({
                parent_goal_id: selectedRoadmapId,
                title: item.title,
                description: item.description,
                progress: item.progress,
                user_id: user.id,
                timeline_row: item.row,
                timeline_start: item.start, 
                timeline_duration: item.duration,
                start_date: item.startDate,
                end_date: item.endDate
              })
              .select();
              
            if (!error && data && data.length > 0) {
              const newItemIndex = updatedItems.findIndex(i => i.id === item.id);
              if (newItemIndex >= 0) {
                updatedItems[newItemIndex].originalSubGoalId = data[0].id;
              }
            }
          }
        } catch (error) {
          console.error('Error updating sub-goal:', error);
        }
      }
      
      const originalIds = roadmapItems.map(item => item.originalSubGoalId).filter(Boolean);
      const updatedIds = updatedItems.map(item => item.originalSubGoalId).filter(Boolean);
      
      const deletedIds = originalIds.filter(id => !updatedIds.includes(id));
      
      for (const id of deletedIds) {
        try {
          await supabase
            .from('sub_goals')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        } catch (error) {
          console.error('Error deleting sub-goal:', error);
        }
      }
    }
    
    return updatedItems;
  };
  
  return { handleItemsChange };
};
