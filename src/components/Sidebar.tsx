
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UserRound, 
  Settings, 
  Palette, 
  Moon, 
  Sun, 
  Star, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ onCollapseChange }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
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

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-screen z-40 border-r transition-all duration-300",
        theme === "dark" ? "bg-apple-dark border-slate-800/80" : "bg-white border-slate-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse button */}
      <button 
        className={cn(
          "absolute -right-3 top-6 glass-card z-50 p-1 rounded-full",
          theme === "dark" ? "border border-slate-800" : "border border-slate-200"
        )}
        onClick={toggleCollapse}
      >
        {collapsed ? 
          <ChevronRight size={18} className="text-emerald" /> : 
          <ChevronLeft size={18} className="text-emerald" />
        }
      </button>

      <div className="flex flex-col h-full p-4">
        {/* User profile section at top */}
        <div className="flex items-center mb-6 mt-2 cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-r from-emerald to-emerald-light text-white text-xl font-bold">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className={cn(
                "font-medium truncate",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                {username}
              </p>
              <p className={theme === "dark" ? "text-slate-400" : "text-slate-500" + " text-sm truncate"}>Level 10</p>
            </div>
          )}
        </div>

        {/* Menu items */}
        <div className="flex-1">
          <ul className="space-y-2">
            <MenuItem 
              icon={<Home size={20} />} 
              label="Home" 
              collapsed={collapsed} 
              onClick={() => navigate('/')} 
            />
            <MenuItem 
              icon={<UserRound size={20} />} 
              label="Profile" 
              collapsed={collapsed} 
              onClick={() => navigate('/profile')} 
            />
            <MenuItem 
              icon={<Settings size={20} />} 
              label="Settings" 
              collapsed={collapsed} 
              onClick={() => {}} 
            />
            <MenuItem 
              icon={<Palette size={20} />} 
              label="Custom Themes" 
              collapsed={collapsed} 
              onClick={() => {}} 
            />
            <MenuItem 
              icon={theme === "dark" ? <Sun size={20} /> : <Moon size={20} />} 
              label={theme === "dark" ? "Day Mode" : "Night Mode"} 
              collapsed={collapsed} 
              onClick={toggleTheme} 
              rightElement={
                <Switch 
                  checked={theme === "light"} 
                  onCheckedChange={toggleTheme} 
                  className="ml-auto"
                />
              }
            />
            <MenuItem 
              icon={<Star size={20} />} 
              label="Upgrade" 
              collapsed={collapsed} 
              onClick={() => {}}
              highlight
            />
          </ul>
        </div>

        {/* Logout at bottom */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start p-2 rounded-lg",
              collapsed && "justify-center",
              theme === "dark" 
                ? "text-slate-300 hover:text-white hover:bg-muted" 
                : "text-slate-700 hover:text-slate-900 hover:bg-muted"
            )}
            onClick={handleSignOut}
          >
            <LogOut size={20} className={theme === "dark" ? "text-slate-300" : "text-slate-700"} />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  onClick: () => void;
  rightElement?: React.ReactNode;
  highlight?: boolean;
}

const MenuItem = ({ icon, label, collapsed, onClick, rightElement, highlight }: MenuItemProps) => {
  const { theme } = useTheme();

  return (
    <li>
      <button
        className={cn(
          "flex items-center w-full p-2 rounded-lg transition-colors",
          highlight 
            ? "text-emerald" 
            : theme === "dark"
              ? "text-slate-300 hover:text-white hover:bg-muted"
              : "text-slate-700 hover:text-slate-900 hover:bg-muted"
        )}
        onClick={onClick}
      >
        <span className={cn(
          "flex items-center justify-center",
          highlight && "text-emerald"
        )}>
          {icon}
        </span>
        {!collapsed && (
          <div className="flex items-center w-full ml-3">
            <span className={cn(
              highlight && "text-emerald font-medium"
            )}>{label}</span>
            {rightElement}
          </div>
        )}
      </button>
    </li>
  );
};

export default Sidebar;
