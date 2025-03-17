
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, UserCog } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const UserBadge = ({ level }: { level: number }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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
        .channel('userbadge-profiles-changes')
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
  
  // Add a profile button if the user is logged in
  if (user) {
    const username = profileData.displayName || user.email?.split('@')[0] || 'User';
    
    return (
      <div className="flex items-center gap-3">
        <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5">
          <div className="relative">
            <Avatar className="w-5 h-5 bg-gradient-to-r from-emerald to-blue-400">
              {profileData.avatarUrl ? (
                <AvatarImage src={profileData.avatarUrl} alt={username} />
              ) : (
                <AvatarFallback className="text-[10px] font-bold">
                  {level}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <span className="text-slate-200 truncate max-w-[100px]">
            {username}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="h-8 px-2">
          <UserCog size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => signOut()} className="h-8 px-2">
          <LogOut size={16} />
        </Button>
      </div>
    );
  }
  
  // Return the default badge for non-logged in users
  return (
    <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5">
      <div className="rounded-full w-5 h-5 bg-gradient-to-r from-emerald to-blue-400 flex items-center justify-center text-[10px] font-bold">
        {level}
      </div>
      <span className="text-slate-200">Guest</span>
    </div>
  );
};

export default UserBadge;
