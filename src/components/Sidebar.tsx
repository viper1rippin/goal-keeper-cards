
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
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ onCollapseChange }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  
  const isDarkMode = theme === "dark";
  
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

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-screen z-40 border-r transition-all duration-300",
        isDarkMode ? "bg-apple-dark border-slate-800/80" : "bg-white/90 border-slate-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse button */}
      <button 
        className={cn(
          "absolute -right-3 top-6 z-50 p-1 rounded-full border",
          isDarkMode ? "glass-card border-slate-800" : "glass-card-light border-slate-300"
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
        <div className="flex items-center mb-6 mt-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald to-emerald-light flex items-center justify-center text-white text-xl font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className={cn(
                "font-medium truncate",
                isDarkMode ? "text-white" : "text-slate-800"
              )}>
                {username}
              </p>
              <p className={cn(
                "text-sm truncate",
                isDarkMode ? "text-slate-400" : "text-slate-500"
              )}>
                Level 10
              </p>
            </div>
          )}
        </div>

        {/* Menu items */}
        <div className="flex-1">
          <ul className="space-y-2">
            <MenuItem 
              icon={<UserRound size={20} />} 
              label="Profile" 
              collapsed={collapsed} 
              onClick={() => navigate('/profile')}
              isDarkMode={isDarkMode}
            />
            <MenuItem 
              icon={<Settings size={20} />} 
              label="Settings" 
              collapsed={collapsed} 
              onClick={() => {}} 
              isDarkMode={isDarkMode}
            />
            <MenuItem 
              icon={<Palette size={20} />} 
              label="Custom Themes" 
              collapsed={collapsed} 
              onClick={() => {}} 
              isDarkMode={isDarkMode}
            />
            <MenuItem 
              icon={isDarkMode ? <Sun size={20} /> : <Moon size={20} />} 
              label={isDarkMode ? "Day Mode" : "Night Mode"} 
              collapsed={collapsed} 
              onClick={toggleTheme} 
              isDarkMode={isDarkMode}
              rightElement={
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch 
                    checked={!isDarkMode} 
                    onCheckedChange={toggleTheme} 
                    className="ml-auto"
                  />
                </div>
              }
            />
            <MenuItem 
              icon={<Star size={20} />} 
              label="Upgrade" 
              collapsed={collapsed} 
              onClick={() => {}}
              highlight
              isDarkMode={isDarkMode}
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
              isDarkMode 
                ? "text-slate-300 hover:text-white hover:bg-muted" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
            onClick={handleSignOut}
          >
            <LogOut size={20} className={isDarkMode ? "text-slate-300" : "text-slate-600"} />
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
  isDarkMode: boolean;
}

const MenuItem = ({ icon, label, collapsed, onClick, rightElement, highlight, isDarkMode }: MenuItemProps) => {
  return (
    <li>
      <button
        className={cn(
          "flex items-center w-full p-2 rounded-lg transition-colors",
          highlight 
            ? "text-emerald" 
            : isDarkMode 
              ? "text-slate-300 hover:text-white hover:bg-muted" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
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
