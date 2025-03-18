
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useDarkMode } from "@/hooks/useDarkMode";

// Import refactored components
import SidebarCollapseButton from "./sidebar/SidebarCollapseButton";
import SidebarProfile from "./sidebar/SidebarProfile";
import SidebarMenu from "./sidebar/SidebarMenu";
import SidebarLogout from "./sidebar/SidebarLogout";

export const SidebarContext = React.createContext<{
  collapsed: boolean;
}>({
  collapsed: false,
});

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ onCollapseChange }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState(1);
  
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, level')
          .eq('id', user.id)
          .maybeSingle();
          
        if (data) {
          setDisplayName(data.display_name || user.email?.split('@')[0] || 'User');
          setAvatarUrl(data.avatar_url);
          setUserLevel(data.level || 1);
        }
      };
      
      fetchProfile();
      
      // Subscribe to profile changes
      const channel = supabase
        .channel('sidebar-profile-updates')
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
              setDisplayName(payload.new.display_name || user.email?.split('@')[0] || 'User');
              setAvatarUrl(payload.new.avatar_url);
              if (payload.new.level) {
                setUserLevel(payload.new.level);
              }
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  const username = displayName || user?.email?.split('@')[0] || 'Guest';

  const sidebarContextValue = {
    collapsed
  };

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <div 
        className={cn(
          "fixed left-0 top-0 h-screen bg-apple-dark z-40 border-r border-slate-800/80 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Collapse button */}
        <SidebarCollapseButton 
          collapsed={collapsed} 
          toggleCollapse={toggleCollapse} 
        />

        <div className="flex flex-col h-full p-4">
          {/* User profile section at top */}
          <SidebarProfile 
            collapsed={collapsed}
            username={username}
            avatarUrl={avatarUrl}
            userLevel={userLevel}
          />

          {/* Menu items */}
          <div className="flex-1">
            <SidebarMenu 
              collapsed={collapsed}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </div>

          {/* Logout at bottom */}
          <div className="mb-6">
            <SidebarLogout 
              collapsed={collapsed}
              onLogout={handleSignOut}
            />
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
