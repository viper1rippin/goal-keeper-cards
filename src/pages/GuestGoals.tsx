
import React from "react";
import { Link } from "react-router-dom";
import AnimatedContainer from "@/components/AnimatedContainer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LockKeyhole } from "lucide-react";
import EmptyGoalsList from "@/components/EmptyGoalsList";
import WelcomeCard from "@/components/WelcomeCard";
import { useState } from "react";

const GuestGoals = () => {
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  
  const handleAddGoal = () => {
    // Open premium features dialog
    const dialogTrigger = document.querySelector('[data-premium-trigger]') as HTMLButtonElement;
    if (dialogTrigger) {
      dialogTrigger.click();
    }
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
          onAddGoal={handleAddGoal} 
          onToggleFocusTimer={() => {}} 
          showFocusTimer={false}
        />
        
        <EmptyGoalsList onCreateGoal={handleAddGoal} />
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
                  <li>Progress tracking</li>
                  <li>Focus timer</li>
                  <li>Mind mapping</li>
                  <li>Project notes</li>
                  <li>AI suggestions</li>
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

      <Footer />
    </div>
  );
};

export default GuestGoals;
