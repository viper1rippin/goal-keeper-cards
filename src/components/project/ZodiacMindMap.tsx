
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import ActionStar from './ActionStar';
import AddActionButton from './AddActionButton';
import ActionEditDialog from './ActionEditDialog';
import { Card } from '@/components/ui/card';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Action, actionsService } from '@/utils/actionsUtils';

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
  const [tableExists, setTableExists] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  
  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (!projectId || !user) return;
    
    const checkTableAndFetchActions = async () => {
      try {
        setIsLoading(true);
        
        // First check if the table exists
        const exists = await actionsService.checkTableExists();
        setTableExists(exists);
        
        // Get actions (either from DB or localStorage depending on table existence)
        const actionsData = await actionsService.getActionsForProject(projectId, user.id);
        setActions(actionsData);
        
        // If table exists and we have local actions, offer to migrate
        if (exists) {
          const localActions = actionsService._getActionsFromLocalStorage(projectId, user.id);
          if (localActions.length > 0) {
            toast({
              title: "Local actions found",
              description: "You have actions stored locally. Migrating to database...",
            });
            
            setIsMigrating(true);
            await actionsService.migrateLocalStorageToDatabase(user.id);
            setIsMigrating(false);
            
            // Refresh the actions list after migration
            const updatedActions = await actionsService.getActionsForProject(projectId, user.id);
            setActions(updatedActions);
            
            toast({
              title: "Migration complete",
              description: "Your actions have been saved to the database.",
            });
          }
        }
      } catch (error) {
        console.error("Overall error fetching actions:", error);
        toast({
          title: "Error",
          description: "Failed to load actions. Using local state instead.",
          variant: "destructive",
        });
        setTableExists(false);
        // Still attempt to get actions from localStorage
        const localActions = actionsService._getActionsFromLocalStorage(projectId, user.id);
        setActions(localActions);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkTableAndFetchActions();
  }, [projectId, user, toast]);

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
      
      // When table exists, use our service functions
      if (actionToEdit) {
        // Update existing action
        await actionsService.updateAction({
          ...actionData,
          id: actionToEdit.id,
          user_id: user.id
        });
        
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
        
        const createdAction = await actionsService.createAction(newAction);
        
        // Add the new action to state
        setActions(prev => [...prev, createdAction]);
      }
      
      toast({
        title: "Success",
        description: `Action ${actionToEdit ? "updated" : "added"} successfully`,
      });
    } catch (error) {
      console.error("Error saving action:", error);
      
      // Fallback to local storage on error
      if (actionToEdit) {
        setActions(prev => 
          prev.map(a => a.id === actionToEdit.id ? { ...actionData, id: actionToEdit.id } : a)
        );
      } else {
        const newAction = {
          ...actionData,
          id: `local-${Date.now()}`,
          user_id: user.id,
          project_id: projectId,
          created_at: new Date().toISOString(),
        };
        setActions(prev => [...prev, newAction]);
      }
      
      toast({
        title: "Warning",
        description: "Could not save to database. Using local storage instead.",
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
      
      // Delete from database using our service function
      await actionsService.deleteAction(id, user.id);
      
      setActions(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Success",
        description: "Action deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting action:", error);
      
      // Delete locally anyway to maintain UI consistency
      setActions(prev => prev.filter(a => a.id !== id));
      
      toast({
        title: "Warning",
        description: "Could not delete from database but removed locally.",
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
      // Update position using our service function
      await actionsService.updateActionPosition(id, user.id, x, y);
    } catch (error) {
      console.error("Error updating action position:", error);
      // Silently fail position updates to avoid disrupting UX
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Handle drag end if needed
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
            The actions table is now available in your database, but this session hasn't connected to it yet.
            Please refresh the page to connect to the database for persistent storage.
          </p>
        </div>
      )}
      
      {isMigrating && (
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-md p-4 mb-6">
          <p className="text-blue-300 text-sm">
            Migrating your locally stored actions to the database...
          </p>
        </div>
      )}
      
      <Card className="bg-slate-900/50 border-slate-800 overflow-hidden relative">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
        </DndContext>
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
