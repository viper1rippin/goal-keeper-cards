
import React, { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ onCollapseChange }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
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

  const username = user?.email?.split('@')[0] || 'Guest';

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Here you would implement actual dark mode toggle logic
  };

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-screen bg-apple-dark z-40 border-r border-slate-800/80 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse button */}
      <button 
        className="absolute -right-3 top-6 glass-card z-50 p-1 rounded-full border border-slate-800"
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
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-emerald to-emerald-light text-white text-xl font-bold">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-white font-medium truncate">{username}</p>
              <p className="text-slate-400 text-sm truncate">Level 10</p>
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
              icon={darkMode ? <Sun size={20} /> : <Moon size={20} />} 
              label="Night Mode" 
              collapsed={collapsed} 
              onClick={toggleDarkMode} 
              rightElement={
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={toggleDarkMode} 
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
              "w-full justify-start text-slate-300 hover:text-white hover:bg-muted p-2 rounded-lg",
              collapsed && "justify-center"
            )}
            onClick={handleSignOut}
          >
            <LogOut size={20} className="text-slate-300" />
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
  return (
    <li>
      <button
        className={cn(
          "flex items-center w-full p-2 rounded-lg hover:bg-muted transition-colors",
          highlight ? "text-emerald" : "text-slate-300 hover:text-white"
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
