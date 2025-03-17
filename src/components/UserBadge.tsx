
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

// Update the existing component to include logout functionality and profile link
const UserBadge = ({ level }: { level: number }) => {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
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
        <div className={cn(
          "py-1 px-3 rounded-full text-sm flex items-center gap-1.5",
          isDarkMode ? "glass-card" : "glass-card-light"
        )}>
          <div className="rounded-full w-5 h-5 bg-gradient-to-r from-emerald to-blue-400 flex items-center justify-center text-[10px] font-bold">
            {level}
          </div>
          <span className={cn(
            "truncate max-w-[100px]",
            isDarkMode ? "text-slate-200" : "text-slate-700"
          )}>
            {userDisplayName}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/profile')} 
          className={cn(
            "h-8 px-2",
            isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
          )}
          title="Edit Profile"
        >
          <Avatar className="w-6 h-6">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={userDisplayName} />
            ) : (
              <AvatarFallback className={cn(
                "text-xs",
                isDarkMode ? "bg-emerald-900/50 text-emerald-300" : "bg-emerald-100 text-emerald-700"
              )}>
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
          <LogOut size={16} className={isDarkMode ? "text-slate-300" : "text-slate-600"} />
        </Button>
      </div>
    );
  }
  
  // Return the default badge for non-logged in users
  return (
    <div className={cn(
      "py-1 px-3 rounded-full text-sm flex items-center gap-1.5",
      isDarkMode ? "glass-card" : "glass-card-light"
    )}>
      <div className="rounded-full w-5 h-5 bg-gradient-to-r from-emerald to-blue-400 flex items-center justify-center text-[10px] font-bold">
        {level}
      </div>
      <span className={isDarkMode ? "text-slate-200" : "text-slate-700"}>Guest</span>
    </div>
  );
};

export default UserBadge;
