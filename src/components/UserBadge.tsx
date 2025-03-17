
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";

const UserBadge = ({ level }: { level: number }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Add a logout button if the user is logged in
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5 animate-gold-sparkle">
          <div className="rounded-full w-5 h-5 bg-gradient-to-r from-gold-dark to-gold-light flex items-center justify-center text-[10px] text-foreground font-bold">
            {level}
          </div>
          <span className="text-foreground truncate max-w-[100px]">
            {user.email?.split('@')[0] || 'User'}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/profile")} 
          className="h-8 px-2"
          title="Profile"
        >
          <User size={16} />
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
    <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5 animate-gold-sparkle">
      <div className="rounded-full w-5 h-5 bg-gradient-to-r from-gold-dark to-gold-light flex items-center justify-center text-[10px] text-foreground font-bold">
        {level}
      </div>
      <span className="text-foreground">Guest</span>
    </div>
  );
};

export default UserBadge;
