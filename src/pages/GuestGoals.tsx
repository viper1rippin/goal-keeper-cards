
import React from "react";
import { Link } from "react-router-dom";
import AnimatedContainer from "@/components/AnimatedContainer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LockKeyhole, BrainCircuit, FileText } from "lucide-react";
import EmptyGoalsList from "@/components/EmptyGoalsList";
import WelcomeCard from "@/components/WelcomeCard";
import { useState } from "react";
import ParentGoalDialog from "@/components/ParentGoalDialog";
import GoalsList from "@/components/GoalsList";
import { Goal } from "@/components/GoalRow";
import { ParentGoal } from "@/components/index/IndexPageTypes";
import { toast } from "@/hooks/use-toast";

const GuestGoals = () => {
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<ParentGoal | null>(null);
  const [parentGoals, setParentGoals] = useState<ParentGoal[]>([]);
  const [activeGoalIndices, setActiveGoalIndices] = useState<{rowIndex: number, goalIndex: number} | null>(null);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  
  // Handle creating or editing a goal
  const handleCreateOrEditGoal = (goal: ParentGoal | null = null) => {
    setGoalToEdit(goal);
    setIsDialogOpen(true);
  };
  
  // Handle goal saved from dialog
  const handleGoalSaved = async () => {
    if (goalToEdit) {
      // Edit existing goal
      setParentGoals(prev => 
        prev.map(p => p.id === goalToEdit.id ? goalToEdit : p)
      );
    } else {
      // Add new goal with temporary ID
      const newGoal: ParentGoal = {
        id: `temp-${Date.now()}`,
        title: goalToEdit?.title || "New Goal",
        description: goalToEdit?.description || "Description",
        goals: [],
      };
      setParentGoals(prev => [...prev, newGoal]);
    }
    
    setIsDialogOpen(false);
    setGoalToEdit(null);
  };
  
  // Handle deleting a parent goal
  const handleDeleteParentGoal = async (id: string) => {
    setParentGoals(prev => prev.filter(p => p.id !== id));
    if (activeGoalIndices && parentGoals[activeGoalIndices.rowIndex]?.id === id) {
      setActiveGoalIndices(null);
      setActiveGoal(null);
    }
    
    toast({
      title: "Premium Feature",
      description: "Sign up to save your goals permanently.",
    });
  };
  
  // Handle deleting a sub-goal
  const handleDeleteSubGoal = async (id: string, parentIndex: number) => {
    const updatedParentGoals = [...parentGoals];
    if (updatedParentGoals[parentIndex]) {
      updatedParentGoals[parentIndex].goals = updatedParentGoals[parentIndex].goals.filter(g => g.id !== id);
      setParentGoals(updatedParentGoals);
      
      if (activeGoalIndices?.rowIndex === parentIndex && 
          activeGoalIndices?.goalIndex !== null && 
          parentGoals[parentIndex]?.goals[activeGoalIndices.goalIndex]?.id === id) {
        setActiveGoalIndices(null);
        setActiveGoal(null);
      }
    }
    
    toast({
      title: "Premium Feature",
      description: "Sign up to save your goals permanently.",
    });
  };
  
  // Handle updating sub-goals
  const handleUpdateSubGoals = (parentIndex: number, updatedGoals: Goal[]) => {
    const updatedParentGoals = [...parentGoals];
    if (updatedParentGoals[parentIndex]) {
      updatedParentGoals[parentIndex].goals = updatedGoals;
      setParentGoals(updatedParentGoals);
    }
  };
  
  // Handle goal focus
  const handleGoalFocus = (goal: Goal, rowIndex: number, goalIndex: number) => {
    setActiveGoal(goal);
    setActiveGoalIndices({rowIndex, goalIndex});
    
    // Show premium dialog for focus timer
    const dialogTrigger = document.querySelector('[data-premium-trigger]') as HTMLButtonElement;
    if (dialogTrigger) {
      dialogTrigger.click();
    }
  };
  
  // Handle drag end (simplified for guest mode)
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    // Move element (simplified)
    const oldIndex = parentGoals.findIndex(item => item.id === active.id);
    const newIndex = parentGoals.findIndex(item => item.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const updatedGoals = [...parentGoals];
      const [movedItem] = updatedGoals.splice(oldIndex, 1);
      updatedGoals.splice(newIndex, 0, movedItem);
      setParentGoals(updatedGoals);
    }
    
    toast({
      title: "Premium Feature",
      description: "Sign up to save your goal order permanently.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Features Banner */}
      <div className="bg-gradient-to-r from-emerald-600/20 via-emerald-600/10 to-transparent border-b border-emerald-600/20">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <p className="text-sm text-slate-300">
            You're in guest mode. Sign up to unlock all features.
          </p>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-emerald hover:bg-emerald-600">Sign up</Button>
            </Link>
          </div>
        </div>
      </div>

      <AnimatedContainer className="flex-1 container mx-auto px-4 py-8">
        <WelcomeCard 
          onAddGoal={() => handleCreateOrEditGoal(null)} 
          onToggleFocusTimer={() => {
            // Open premium features dialog
            const dialogTrigger = document.querySelector('[data-premium-trigger]') as HTMLButtonElement;
            if (dialogTrigger) {
              dialogTrigger.click();
            }
          }} 
          showFocusTimer={false}
        />
        
        {parentGoals.length === 0 ? (
          <EmptyGoalsList onCreateGoal={() => handleCreateOrEditGoal(null)} />
        ) : (
          <GoalsList 
            parentGoals={parentGoals}
            activeGoalIndices={activeGoalIndices}
            onGoalFocus={handleGoalFocus}
            onUpdateSubGoals={handleUpdateSubGoals}
            onEditGoal={handleCreateOrEditGoal}
            onDragEnd={handleDragEnd}
            onDeleteParentGoal={handleDeleteParentGoal}
            onDeleteSubGoal={handleDeleteSubGoal}
          />
        )}
      </AnimatedContainer>

      {/* Premium Features Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="fixed bottom-6 right-6 bg-black/50 backdrop-blur-sm border-emerald-600/20"
            data-premium-trigger
          >
            <LockKeyhole className="mr-2 h-4 w-4" />
            Premium Features
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Premium Features</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                Sign up to unlock premium features:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    <span>Progress tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>Focus timer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <BrainCircuit size={16} className="text-emerald-400" />
                    <span>Mind mapping</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText size={16} className="text-emerald-400" />
                    <span>Project notes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>AI suggestions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>Cloud sync & backup</span>
                  </li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link to="/signup">
                <Button className="bg-emerald hover:bg-emerald-600">
                  Sign up now
                </Button>
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Goal Dialog */}
      <ParentGoalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        goalToEdit={goalToEdit}
        onGoalSaved={handleGoalSaved}
      />

      <Footer />
    </div>
  );
};

export default GuestGoals;
