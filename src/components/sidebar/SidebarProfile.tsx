
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProfileProps {
  collapsed: boolean;
  username: string;
  avatarUrl: string | null;
}

const SidebarProfile = ({ collapsed, username, avatarUrl }: SidebarProfileProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center mb-6 mt-2 cursor-pointer" onClick={() => navigate('/profile')}>
      <Avatar className="w-10 h-10">
        <AvatarImage src={avatarUrl || undefined} />
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
  );
};

export default SidebarProfile;
