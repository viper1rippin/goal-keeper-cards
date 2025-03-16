
import React from 'react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface UserBadgeProps {
  level: number;
}

const UserBadge = ({ level }: UserBadgeProps) => {
  const { user, signOut } = useAuth();
  
  const userEmail = user?.email || 'User';
  const displayName = userEmail.split('@')[0];
  
  return (
    <div className="flex gap-3 items-center">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-semibold text-white">
          {level}
        </div>
        <span className="text-sm font-medium text-white">{displayName}</span>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={signOut}
        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
        title="Sign out"
      >
        <LogOut size={16} />
      </Button>
    </div>
  );
};

export default UserBadge;
