
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

// Update the existing component to include logout functionality and profile link
const UserBadge = ({ level }: { level: number }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Fetch user profile data
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setDisplayName(data.display_name);
          setAvatarUrl(data.avatar_url);
        }
      };
      
      fetchProfile();
    }
  }, [user]);
  
  // Add a logout button if the user is logged in
  if (user) {
    const userDisplayName = displayName || user.email?.split('@')[0] || 'User';
    
    return (
      <div className="flex items-center gap-3">
        <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5">
          <div className="rounded-full w-5 h-5 bg-gradient-to-r from-emerald to-blue-400 flex items-center justify-center text-[10px] font-bold">
            {level}
          </div>
          <span className="text-slate-200 truncate max-w-[100px]">
            {userDisplayName}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/profile')} 
          className="h-8 px-2 text-slate-300 hover:text-white"
          title="Edit Profile"
        >
          <Avatar className="w-6 h-6">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={userDisplayName} />
            ) : (
              <AvatarFallback className="bg-emerald-900/50 text-emerald-300 text-xs">
                {userDisplayName[0]?.toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => signOut()} 
          className="h-8 px-2"
          title="Sign Out"
        >
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
