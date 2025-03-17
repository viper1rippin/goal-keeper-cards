
import React, { useEffect, useState } from "react";
import { formatTime } from "@/utils/timerUtils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface TimerDisplayProps {
  time: number;
  isActive: boolean;
  earnedPoints: number;
  pointsForNextLevel: number;
  userLevel: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  time,
  isActive,
  earnedPoints,
  pointsForNextLevel,
  userLevel,
}) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({ displayName: "", avatarUrl: null });
  
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setProfileData({
            displayName: data.display_name || user.email?.split('@')[0] || 'User',
            avatarUrl: data.avatar_url
          });
        }
      };
      
      fetchProfile();
      
      // Subscribe to changes in the profiles table
      const subscription = supabase
        .channel('timer-profiles-changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, payload => {
          if (payload.new) {
            setProfileData({
              displayName: payload.new.display_name || user.email?.split('@')[0] || 'User',
              avatarUrl: payload.new.avatar_url
            });
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);
  
  // Calculate hours remaining for next level
  const hoursNeeded = Math.ceil(pointsForNextLevel / 60);
  const username = profileData.displayName || user?.email?.split('@')[0] || 'User';
  
  return (
    <div className="space-y-6">
      {/* User info section - removed logout button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8 bg-gradient-to-r from-emerald to-blue-400">
            {profileData.avatarUrl ? (
              <AvatarImage src={profileData.avatarUrl} alt={username} />
            ) : (
              <AvatarFallback className="text-xs font-bold">
                {userLevel}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="text-slate-200 truncate max-w-[150px]">
            {username}
          </span>
        </div>
        <div className="text-right text-slate-400 text-sm">
          {earnedPoints.toFixed(1)}/{pointsForNextLevel} points
        </div>
      </div>
      
      {/* Timer display */}
      <div className="text-center">
        <div className={cn(
          "font-mono text-5xl tracking-widest",
          isActive ? "text-emerald" : "text-slate-200"
        )}>
          {formatTime(time)}
        </div>
        <div className="text-slate-400 text-sm mt-2">
          ~{hoursNeeded} hours of focus needed for next level
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
