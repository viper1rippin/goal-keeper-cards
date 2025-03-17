
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// Add this import at the top
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

// Update the existing component to remove logout functionality
const UserBadge = ({ level }: { level: number }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // User badge without logout button
  if (user) {
    return (
      <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5">
        <span className="text-slate-200 truncate max-w-[100px]">
          {user.email?.split('@')[0] || 'User'}
        </span>
      </div>
    );
  }
  
  // Return the default badge for non-logged in users
  return (
    <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5">
      <span className="text-slate-200">Guest</span>
    </div>
  );
};

export default UserBadge;
