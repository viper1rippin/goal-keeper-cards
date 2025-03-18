
import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getCurrentBadge } from "@/utils/badgeUtils";
import { LogIn } from "lucide-react";

interface SidebarProfileProps {
  collapsed: boolean;
  username: string;
  avatarUrl: string | null;
  userLevel: number;
  isGuest?: boolean;
}

const SidebarProfile = ({ 
  collapsed, 
  username, 
  avatarUrl, 
  userLevel,
  isGuest = false
}: SidebarProfileProps) => {
  const currentBadge = getCurrentBadge(userLevel);
  const BadgeIcon = currentBadge.icon;
  
  return (
    <div className={cn(
      "py-4 mb-6",
      collapsed ? "flex flex-col items-center" : ""
    )}>
      <div className={cn(
        "flex",
        collapsed ? "flex-col items-center" : "items-center"
      )}>
        <Avatar className={cn(
          "border-2 border-slate-700",
          collapsed ? "h-10 w-10 mb-2" : "h-12 w-12 mr-3"
        )}>
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className={`bg-gradient-to-r ${currentBadge.color}`}>
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-medium text-slate-200">
              {username}
            </span>
            <div className="flex items-center text-xs text-slate-400 gap-1">
              <BadgeIcon className="h-3 w-3" />
              <span>{currentBadge.name}</span>
            </div>
          </div>
        )}
      </div>
      
      {!collapsed && isGuest && (
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Login to Save Progress
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default SidebarProfile;
