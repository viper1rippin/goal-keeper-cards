
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentBadge } from "@/utils/badgeUtils";
import { Badge } from "./ui/badge";
import { SUBSCRIPTION_TIERS, formatSubscriptionTier } from "@/utils/subscriptionUtils";

const UserBadge = ({ level }: { level: number }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPatriot, setIsPatriot] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState(SUBSCRIPTION_TIERS.FREE);
  
  // Get the user's current badge based on their level and premium status
  const currentBadge = getCurrentBadge(level, isPatriot);
  const BadgeIcon = currentBadge.icon;
  
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, is_patriot, subscription_tier')
          .eq('id', user.id)
          .maybeSingle();
          
        if (data) {
          setDisplayName(data.display_name || user.email?.split('@')[0] || 'User');
          setAvatarUrl(data.avatar_url);
          setIsPatriot(data.is_patriot || false);
          setSubscriptionTier(data.subscription_tier || SUBSCRIPTION_TIERS.FREE);
        }
      };
      
      fetchProfile();
      
      // Subscribe to changes in the profiles table for this user
      const channel = supabase
        .channel('profile-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            console.log('Profile updated:', payload);
            if (payload.new) {
              setDisplayName(payload.new.display_name || user.email?.split('@')[0] || 'User');
              setAvatarUrl(payload.new.avatar_url);
              setIsPatriot(payload.new.is_patriot || false);
              setSubscriptionTier(payload.new.subscription_tier || SUBSCRIPTION_TIERS.FREE);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
  // Add a logout button if the user is logged in
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5">
          <Avatar className="w-5 h-5">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className={`bg-gradient-to-r ${currentBadge.color} flex items-center justify-center text-[10px] font-bold`}>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-slate-200 truncate max-w-[100px]">
            {displayName}
          </span>
          <Badge 
            variant="outline" 
            className="ml-1 px-1.5 py-0 h-4 text-[10px] bg-transparent border-slate-600 cursor-pointer hover:border-emerald/40 transition-colors"
            onClick={() => navigate('/progress')}
          >
            <BadgeIcon className="h-2.5 w-2.5 mr-0.5" />
            {currentBadge.name}
          </Badge>
          {subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM && (
            <Badge 
              variant="outline" 
              className="ml-1 px-1.5 py-0 h-4 text-[10px] bg-transparent border-yellow-600 cursor-pointer text-yellow-400"
              onClick={() => navigate('/profile')}
            >
              <Star className="h-2.5 w-2.5 mr-0.5 text-yellow-400" />
              Premium
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut()} className="h-8 px-2">
          <LogOut size={16} />
        </Button>
      </div>
    );
  }
  
  // Return the default badge for non-logged in users
  return (
    <div className="glass-card py-1 px-3 rounded-full text-sm flex items-center gap-1.5">
      <div className="rounded-full w-5 h-5 bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-[10px] font-bold">
        {level}
      </div>
      <span className="text-slate-200">Guest</span>
    </div>
  );
};

export default UserBadge;
