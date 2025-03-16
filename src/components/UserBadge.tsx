
import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Shield, Sword, Award, Crown, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export type BadgeLevel = 
  | "soldier" 
  | "knight" 
  | "elite_knight" 
  | "general" 
  | "commander" 
  | "king" 
  | "emperor";

interface BadgeConfig {
  name: string;
  level: number;
  icon: React.ReactNode;
  color: string;
}

export const badgeConfigs: Record<BadgeLevel, BadgeConfig> = {
  soldier: {
    name: "Soldier",
    level: 10,
    icon: <Shield className="mr-1" size={14} />,
    color: "bg-slate-500"
  },
  knight: {
    name: "Knight",
    level: 20,
    icon: <Sword className="mr-1" size={14} />,
    color: "bg-slate-400"
  },
  elite_knight: {
    name: "Elite Knight",
    level: 45,
    icon: <Sword className="mr-1" size={14} strokeWidth={2.5} />,
    color: "bg-blue-500"
  },
  general: {
    name: "General",
    level: 70,
    icon: <Award className="mr-1" size={14} />,
    color: "bg-purple-500"
  },
  commander: {
    name: "Commander",
    level: 100,
    icon: <Award className="mr-1" size={14} strokeWidth={2.5} />,
    color: "bg-purple-400"
  },
  king: {
    name: "King",
    level: 120,
    icon: <Crown className="mr-1" size={14} />,
    color: "bg-amber-500"
  },
  emperor: {
    name: "Emperor",
    level: 200,
    icon: <Trophy className="mr-1" size={14} />,
    color: "bg-emerald"
  }
};

interface UserBadgeProps {
  level: number;
  showLevel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const getBadgeByLevel = (level: number): BadgeLevel => {
  if (level >= 200) return "emperor";
  if (level >= 120) return "king";
  if (level >= 100) return "commander";
  if (level >= 70) return "general";
  if (level >= 45) return "elite_knight";
  if (level >= 20) return "knight";
  return "soldier";
};

const UserBadge: React.FC<UserBadgeProps> = ({ 
  level, 
  showLevel = true,
  size = "md" 
}) => {
  const { user } = useAuth();
  const badgeType = getBadgeByLevel(level);
  const badge = badgeConfigs[badgeType];
  
  const sizeClasses = {
    sm: "text-xs py-0 px-1.5",
    md: "text-xs py-0.5 px-2",
    lg: "text-sm py-1 px-2.5"
  };

  // Get the first part of the email for display
  const displayName = user?.email ? user.email.split('@')[0] : 'User';

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        className={cn(
          "flex items-center font-medium", 
          badge.color,
          sizeClasses[size]
        )}
      >
        {badge.icon}
        {badge.name}
        {showLevel && <span className="ml-1 opacity-80">Lvl {level}</span>}
      </Badge>
      <span className="text-sm text-slate-300">{displayName}</span>
    </div>
  );
};

export default UserBadge;
