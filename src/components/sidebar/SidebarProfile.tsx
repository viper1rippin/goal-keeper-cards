
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentBadge } from "@/utils/badgeUtils";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface SidebarProfileProps {
  collapsed: boolean;
  username: string;
  avatarUrl: string | null;
}

const SidebarProfile = ({ collapsed, username, avatarUrl }: SidebarProfileProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userLevel, setUserLevel] = useState(1);
  
  useEffect(() => {
    if (user) {
      const fetchUserLevel = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('level')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user level:', error);
          return;
        }
        
        if (data) {
          setUserLevel(data.level || 1);
        }
      };
      
      fetchUserLevel();
      
      // Subscribe to updates
      const channel = supabase
        .channel('profile-level-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new) {
              setUserLevel(payload.new.level || 1);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
  const currentBadge = getCurrentBadge(userLevel);
  const BadgeIcon = currentBadge.icon;
  
  return (
    <div className="flex items-center mb-6 mt-2 cursor-pointer" onClick={() => navigate('/profile')}>
      <Avatar className="w-10 h-10">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className={`bg-gradient-to-r ${currentBadge.color} text-white text-xl font-bold`}>
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="ml-3 overflow-hidden">
          <p className="text-white font-medium truncate">{username}</p>
          <div className="flex items-center">
            <p className="text-slate-400 text-sm truncate">Level {userLevel}</p>
            <Badge 
              variant="outline" 
              className="ml-2 px-1.5 py-0 h-4 text-[10px] bg-transparent border-slate-600 cursor-pointer hover:border-emerald/40 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/progress');
              }}
            >
              <BadgeIcon className="h-2.5 w-2.5 mr-0.5" />
              {currentBadge.name}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarProfile;
