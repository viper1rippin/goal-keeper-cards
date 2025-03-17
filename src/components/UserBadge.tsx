
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const UserBadge = ({ level }: { level: number }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
          
        if (data) {
          setDisplayName(data.display_name || user.email?.split('@')[0] || 'User');
          setAvatarUrl(data.avatar_url);
        }
      };
      
      fetchProfile();
      
      // Subscribe to profile changes
      const profileChanges = supabase
        .channel('badge-profile-changes')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, () => {
          fetchProfile();
        })
        .subscribe();
        
      return () => {
        profileChanges.unsubscribe();
      };
    }
  }, [user]);
  
  // Add a logout button if the user is logged in
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5">
          <Avatar className="w-5 h-5">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-r from-emerald to-blue-400 flex items-center justify-center text-[10px] font-bold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-slate-200 truncate max-w-[100px]">
            {displayName}
          </span>
        </div>
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
