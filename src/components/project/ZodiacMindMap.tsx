
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import ActionStar from './ActionStar';
import AddActionButton from './AddActionButton';
import ActionEditDialog from './ActionEditDialog';
import { Card } from '@/components/ui/card';

export interface Action {
  id?: string;
  content: string;
  position_x: number;
  position_y: number;
  project_id: string;
  user_id?: string;
  created_at?: string;
}

interface ZodiacMindMapProps {
  projectId: string;
}

const ZodiacMindMap: React.FC<ZodiacMindMapProps> = ({ projectId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionToEdit, setActionToEdit] = useState<Action | null>(null);
  const [tableExists, setTableExists] = useState(true);

  useEffect(() => {
    if (!projectId || !user) return;
    
    const checkTableAndFetchActions = async () => {
      try {
        setIsLoading(true);
        
        // First check if the table exists
        const { error: tableCheckError } = await supabase
          .from('actions')
          .select('id')
          .limit(1);
        
        // If we get an error about relation not existing, table doesn't exist
        if (tableCheckError && tableCheckError.message.includes('relation "actions" does not exist')) {
          setTableExists(false);
          setActions([]);
          setIsLoading(false);
          return;
        }
        
        // Table exists, fetch actions
        setTableExists(true);
        const { data, error } = await supabase
          .from('actions')
          .select('*')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        setActions(data || []);
      } catch (error) {
        console.error("Error fetching actions:", error);
        toast({
          title: "Error",
          description: "Failed to load actions. Using local state instead.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkTableAndFetchActions();
  }, [projectId, user]);

  const handleAddAction = () => {
    setActionToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditAction = (action: Action) => {
    setActionToEdit(action);
    setIsDialogOpen(true);
  };

  const handleSaveAction = async (actionData: Action) => {
    if (!user) return;
    
    try {
      // When table doesn't exist, just use local state
      if (!tableExists) {
        if (actionToEdit) {
          // Update existing action in local state
          setActions(prev => 
            prev.map(a => a.id === actionToEdit.id ? { ...actionData, id: actionToEdit.id } : a)
          );
        } else {
          // Add new action to local state
          const newAction = {
            ...actionData,
            id: `local-${Date.now()}`,
            created_at: new Date().toISOString(),
          };
          setActions(prev => [...prev, newAction]);
        }
        
        toast({
          title: "Success",
          description: `Action ${actionToEdit ? "updated" : "added"} (local only)`,
        });
        
        setIsDialogOpen(false);
        return;
      }
      
      // When table exists, use Supabase
      if (actionToEdit) {
        // Update existing action
        const { error } = await supabase
          .from('actions')
          .update({
            content: actionData.content,
            position_x: actionData.position_x,
            position_y: actionData.position_y,
          })
          .eq('id', actionToEdit.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setActions(prev => 
          prev.map(a => a.id === actionToEdit.id ? { ...actionData, id: actionToEdit.id } : a)
        );
      } else {
        // Create new action
        const newAction = {
          ...actionData,
          user_id: user.id,
          project_id: projectId,
        };
        
        const { data, error } = await supabase
          .from('actions')
          .insert(newAction)
          .select('*')
          .single();
        
        if (error) throw error;
        
        if (data) {
          setActions(prev => [...prev, data]);
        }
      }
      
      toast({
        title: "Success",
        description: `Action ${actionToEdit ? "updated" : "added"} successfully`,
      });
    } catch (error) {
      console.error("Error saving action:", error);
      toast({
        title: "Error",
        description: "Failed to save action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
    }
  };

  const handleDeleteAction = async (id: string) => {
    if (!user) return;
    
    try {
      // For local-only mode
      if (!tableExists || id.startsWith('local-')) {
        setActions(prev => prev.filter(a => a.id !== id));
        toast({
          title: "Success",
          description: "Action deleted (local only)",
        });
        return;
      }
      
      // Delete from database
      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setActions(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Success",
        description: "Action deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting action:", error);
      toast({
        title: "Error",
        description: "Failed to delete action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePosition = async (id: string, x: number, y: number) => {
    if (!user) return;
    
    // Update local state first for immediate feedback
    setActions(prev => 
      prev.map(a => a.id === id ? { ...a, position_x: x, position_y: y } : a)
    );
    
    // Skip server update for local-only mode
    if (!tableExists || id.startsWith('local-')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('actions')
        .update({ position_x: x, position_y: y })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating action position:", error);
      // Silently fail position updates to avoid disrupting UX
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Action Mind Map</h2>
        <AddActionButton onClick={handleAddAction} />
      </div>
      
      {!tableExists && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-md p-4 mb-6">
          <p className="text-amber-300 text-sm">
            The actions table doesn't exist yet in your database. Your actions will be stored locally for now.
            Please run the migration to create the table for persistent storage.
          </p>
        </div>
      )}
      
      <Card className="bg-slate-900/50 border-slate-800 overflow-hidden relative">
        <div 
          className="relative min-h-[500px] w-full p-8 rounded-lg"
          style={{
            background: 'radial-gradient(circle at center, #1a2036 0%, #131625 100%)',
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Starry background */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.8 + 0.2,
                  animation: `pulse ${Math.random() * 4 + 2}s infinite alternate`
                }}
              />
            ))}
          </div>
          
          {/* Center point */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500/80 shadow-lg shadow-emerald-500/40 z-10">
            <div className="absolute inset-0 rounded-full animate-pulse bg-emerald-400/40"></div>
          </div>
          
          {/* Action stars */}
          {actions.map((action) => (
            <ActionStar
              key={action.id}
              action={action}
              onEdit={() => handleEditAction(action)}
              onDelete={() => action.id && handleDeleteAction(action.id)}
              onUpdatePosition={handleUpdatePosition}
            />
          ))}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
              <p className="text-slate-400">Loading actions...</p>
            </div>
          )}
          
          {!isLoading && actions.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <p className="text-slate-400 mb-4">No actions added yet. Create your first action by clicking the + button.</p>
              <AddActionButton onClick={handleAddAction} />
            </div>
          )}
        </div>
      </Card>
      
      <ActionEditDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveAction}
        action={actionToEdit}
        projectId={projectId}
      />
    </div>
  );
};

export default ZodiacMindMap;
