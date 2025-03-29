
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ParentGoal } from '@/components/index/IndexPageTypes';
import { SubGoalTimelineItem } from '@/components/roadmap/types';
import { Goal } from '@/components/GoalRow';

export const useRoadmapData = () => {
  const { user } = useAuth();
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [roadmapItems, setRoadmapItems] = useState<SubGoalTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParentGoals = async () => {
      if (!user) {
        setParentGoals([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data: parentGoalsData, error: parentGoalsError } = await supabase
          .from('parent_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('position', { ascending: true });
        
        if (parentGoalsError) throw parentGoalsError;
        
        const { data: allSubGoals, error: subGoalsError } = await supabase
          .from('sub_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('display_order', { ascending: true });
          
        if (subGoalsError) throw subGoalsError;
        
        const groupedSubGoals: Record<string, Goal[]> = {};
        
        if (parentGoalsData) {
          parentGoalsData.forEach(parent => {
            groupedSubGoals[parent.id] = [];
          });
        }
        
        if (allSubGoals) {
          allSubGoals.forEach((subGoal: any) => {
            if (groupedSubGoals[subGoal.parent_goal_id]) {
              groupedSubGoals[subGoal.parent_goal_id].push({
                id: subGoal.id,
                title: subGoal.title,
                description: subGoal.description,
                progress: subGoal.progress || 0,
                startDate: subGoal.start_date,
                endDate: subGoal.end_date,
                timeline_row: subGoal.timeline_row,
                timeline_start: subGoal.timeline_start,
                timeline_duration: subGoal.timeline_duration
              });
            }
          });
        }
        
        if (parentGoalsData) {
          const formattedParentGoals: ParentGoal[] = parentGoalsData.map(pg => ({
            id: pg.id,
            title: pg.title,
            description: pg.description,
            goals: groupedSubGoals[pg.id] || [],
            position: pg.position || 0,
            user_id: pg.user_id
          }));
          
          setParentGoals(formattedParentGoals);
          
          if (!selectedRoadmapId && formattedParentGoals.length > 0) {
            setSelectedRoadmapId(formattedParentGoals[0].id);
          }
        }
        
      } catch (error) {
        console.error('Error fetching parent goals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load parent goals. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParentGoals();
  }, [user, selectedRoadmapId]);
  
  useEffect(() => {
    const loadSubGoalsToTimeline = () => {
      if (!selectedRoadmapId || !parentGoals.length) return;
      
      const selectedParent = parentGoals.find(pg => pg.id === selectedRoadmapId);
      if (!selectedParent) return;
      
      const items: SubGoalTimelineItem[] = selectedParent.goals.map((subGoal, index) => {
        const row = subGoal.timeline_row !== undefined ? subGoal.timeline_row : Math.floor(index / 3);
        const start = subGoal.timeline_start !== undefined ? subGoal.timeline_start : index * 3;
        const duration = subGoal.timeline_duration !== undefined ? subGoal.timeline_duration : 2;
        
        return {
          id: subGoal.id || '',
          title: subGoal.title,
          description: subGoal.description,
          row: row,
          start: start,
          duration: duration,
          progress: subGoal.progress || 0,
          parentId: selectedRoadmapId,
          originalSubGoalId: subGoal.id,
          startDate: subGoal.startDate || undefined,
          endDate: subGoal.endDate || undefined
        };
      });
      
      setRoadmapItems(items);
    };
    
    loadSubGoalsToTimeline();
  }, [selectedRoadmapId, parentGoals]);

  return {
    parentGoals,
    selectedRoadmapId,
    setSelectedRoadmapId,
    roadmapItems,
    setRoadmapItems,
    isLoading
  };
};
