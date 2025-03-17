import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Timer } from "lucide-react";
import AnimatedContainer from "./AnimatedContainer";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface WelcomeCardProps {
  onAddGoal: () => void;
  onToggleFocusTimer?: () => void;
  showFocusTimer?: boolean;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ onAddGoal, onToggleFocusTimer, showFocusTimer }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [displayName, setDisplayName] = useState<string>("");
  
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle();
          
        if (data && data.display_name) {
          setDisplayName(data.display_name);
        } else {
          setDisplayName(user.email?.split('@')[0] || 'Guest');
        }
      };
      
      fetchProfile();
      
      const channel = supabase
        .channel('welcome-profile-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new && payload.new.display_name) {
              setDisplayName(payload.new.display_name);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
  const username = displayName || user?.email?.split('@')[0] || 'Guest';
  
  return (
    <AnimatedContainer className="w-full mb-8">
      <div className="glass-card p-5 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className={cn(
              "text-sm",
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            )}>
              Welcome back, {username}. Set a goal and stay focused.
            </p>
          </div>
          <div className="flex items-center space-x-3 self-end md:self-auto">
            {user && (
              <Button 
                variant={showFocusTimer ? "default" : "outline"}
                onClick={onToggleFocusTimer}
                size="sm"
                className={`${showFocusTimer ? "bg-emerald hover:bg-emerald-dark" : "border-emerald/20 hover:border-emerald/40"}`}
              >
                <Timer className="mr-2" size={16} />
                {showFocusTimer ? "Focusing" : "Focus"}
              </Button>
            )}
            <Button 
              onClick={onAddGoal}
              size="sm"
              className="bg-emerald hover:bg-emerald-dark"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default WelcomeCard;
