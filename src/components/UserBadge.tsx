
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserBadge = ({ level }: { level: number }) => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Get display name from userProfile or fallback to email
  const displayName = userProfile?.displayName || user?.email?.split('@')[0] || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();
  
  // Add a logout button if the user is logged in
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5">
          <div className="rounded-full w-5 h-5 bg-gradient-to-r from-emerald to-blue-400 flex items-center justify-center text-[10px] font-bold">
            {level}
          </div>
          <span className="text-foreground truncate max-w-[100px]">
            {displayName}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/profile")} 
          className="h-8 p-0 w-8 rounded-full"
          title="Profile"
        >
          <Avatar className="h-8 w-8">
            {userProfile?.avatarUrl ? (
              <AvatarImage src={userProfile.avatarUrl} alt={displayName} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-emerald to-emerald-light text-white text-xs">
                {userInitial}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => signOut()} 
          className="h-8 px-2"
          title="Logout"
        >
          <LogOut size={16} />
        </Button>
      </div>
    );
  }
  
  // Return the default badge for non-logged in users
  return (
    <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5">
      <div className="rounded-full w-5 h-5 bg-gradient-to-r from-emerald to-blue-400 flex items-center justify-center text-[10px] font-bold">
        {level}
      </div>
      <span className="text-foreground">Guest</span>
    </div>
  );
};

export default UserBadge;
