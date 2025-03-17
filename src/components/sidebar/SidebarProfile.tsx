
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentBadge } from "@/utils/badgeUtils";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { SUBSCRIPTION_TIERS } from "@/utils/subscriptionUtils";

interface SidebarProfileProps {
  collapsed: boolean;
  username: string;
  avatarUrl: string | null;
  userLevel?: number;
  isPatriot?: boolean;
  subscriptionTier?: string;
}

const SidebarProfile = ({ 
  collapsed, 
  username, 
  avatarUrl, 
  userLevel = 1,
  isPatriot = false,
  subscriptionTier = SUBSCRIPTION_TIERS.FREE
}: SidebarProfileProps) => {
  const navigate = useNavigate();
  const currentBadge = getCurrentBadge(userLevel, isPatriot);
  const BadgeIcon = currentBadge.icon;
  const isPremium = subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM;
  
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
            {isPremium && (
              <Badge 
                variant="outline" 
                className="ml-2 px-1.5 py-0 h-4 text-[10px] bg-transparent border-yellow-600 cursor-pointer text-yellow-400"
              >
                <Star className="h-2.5 w-2.5 mr-0.5 text-yellow-400" />
                Premium
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarProfile;
