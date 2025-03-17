import React, { useState, useEffect, useRef } from "react";
import { User, Camera, Save, Eye, EyeOff, Key, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatTime, calculateTimeForNextLevel } from "@/utils/timerUtils";
import { getCurrentBadge, getNextBadge, badges, POINTS_FOR_LEVEL_UP } from "@/utils/badgeUtils";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  
  const [userLevel, setUserLevel] = useState(10);
  const [earnedPoints, setEarnedPoints] = useState(500);

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setDisplayName(data.display_name || "");
          setAvatarUrl(data.avatar_url);
          setUserLevel(data.level || 10);
          setEarnedPoints(data.points || 500);
        }
        
        setEmail(user.email || "");
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "Error fetching profile",
          description: "There was a problem fetching your profile data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, toast]);

  const uploadAvatar = async (file: File) => {
    try {
      if (!user) return;
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      setSaving(true);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      setAvatarUrl(data.publicUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was a problem uploading your avatar.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Avatar image must be less than 2MB",
        });
        return;
      }
      uploadAvatar(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const updateProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "There was a problem updating your password.",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateLevelData = () => {
    const data = [];
    let currentLevel = Math.max(1, userLevel - 3);
    const maxLevel = Math.min(badges.length > 0 ? badges[badges.length - 1].level : 200, userLevel + 5);

    for (let level = currentLevel; level <= maxLevel; level++) {
      const badge = getCurrentBadge(level);
      data.push({
        level: level,
        badge: badge.name,
        points: level * POINTS_FOR_LEVEL_UP,
        color: badge.color.split(' ')[1]
      });
    }
    return data;
  };

  const calculateLevelProgress = () => {
    const pointsForCurrentLevel = userLevel * POINTS_FOR_LEVEL_UP;
    const pointsForNextLevel = (userLevel + 1) * POINTS_FOR_LEVEL_UP;
    const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel;
    const pointsGained = earnedPoints - pointsForCurrentLevel;
    return Math.min(100, Math.max(0, (pointsGained / pointsNeeded) * 100));
  };

  const hoursForNextLevel = calculateTimeForNextLevel(earnedPoints, (userLevel + 1) * POINTS_FOR_LEVEL_UP);

  const badgesData = badges.map(badge => ({
    ...badge,
    achieved: userLevel >= badge.level,
  }));

  const currentBadge = getCurrentBadge(userLevel);
  const nextBadge = getNextBadge(userLevel);
  const levelProgress = calculateLevelProgress();
  const levelData = generateLevelData();

  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapseChange={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Profile Settings</h1>
          </div>
          
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-1">
                <BarChart3 size={16} /> Progress
              </TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Update your profile picture</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                        {avatarUrl ? (
                          <AvatarImage src={avatarUrl} alt="Profile" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-emerald to-emerald-light text-2xl">
                            {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div 
                        className="absolute bottom-0 right-0 rounded-full bg-emerald p-1 cursor-pointer" 
                        onClick={handleAvatarClick}
                      >
                        <Camera size={16} className="text-white" />
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User size={18} />
                        <label htmlFor="displayName" className="text-sm font-medium">
                          Display Name
                        </label>
                      </div>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        Email
                      </label>
                      <Input
                        id="email"
                        value={email}
                        readOnly
                        disabled
                        className="bg-gray-100 text-gray-700"
                      />
                    </div>
                    
                    <Button
                      onClick={updateProfile}
                      disabled={saving || isLoading}
                      className="mt-4 w-full md:w-auto"
                    >
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="progress">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Level Progress</CardTitle>
                    <CardDescription>Your current level and progress toward the next level</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${currentBadge.color} flex items-center justify-center text-white font-bold text-xl`}>
                          {userLevel}
                        </div>
                        <div>
                          <h3 className="font-semibold">Level {userLevel}</h3>
                          <p className="text-sm text-muted-foreground">{currentBadge.name} Badge</p>
                        </div>
                      </div>
                      
                      {nextBadge && (
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold text-right">Next: Level {nextBadge.level}</h3>
                            <p className="text-sm text-muted-foreground text-right">{nextBadge.name} Badge</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-xl opacity-50">
                            {nextBadge.level}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current: {earnedPoints} points</span>
                        <span>Next Level: {(userLevel + 1) * POINTS_FOR_LEVEL_UP} points</span>
                      </div>
                      <Progress value={levelProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground text-center mt-1">
                        {Math.round(levelProgress)}% complete ({hoursForNextLevel} hours of focus time needed)
                      </p>
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-3">Level Progression</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={levelData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="level" label={{ value: 'Level', position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: 'Points', angle: -90, position: 'insideLeft' }} />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-background border rounded p-2 shadow-lg">
                                      <p className="font-medium">Level {data.level}</p>
                                      <p className="text-sm">{data.badge} Badge</p>
                                      <p className="text-sm">{data.points} Points Required</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar 
                              dataKey="points" 
                              fill="#8884d8"
                              radius={[4, 4, 0, 0]}
                              barSize={30}
                              name="Points Required"
                            >
                              {levelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.level <= userLevel ? '#10b981' : '#94a3b8'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Badges Collection</CardTitle>
                    <CardDescription>Badges you've earned and badges to unlock</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {badgesData.map((badge) => {
                        const BadgeIcon = badge.icon;
                        return (
                          <div 
                            key={badge.name} 
                            className={`border rounded-lg p-4 text-center ${
                              badge.achieved ? 'bg-gradient-to-b from-background to-muted' : 'opacity-60 grayscale'
                            }`}
                          >
                            <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-r ${
                              badge.achieved ? badge.color : 'from-gray-400 to-gray-500'
                            } flex items-center justify-center mb-2`}>
                              <BadgeIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-medium">{badge.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {badge.achieved ? 'Unlocked' : `Unlock at level ${badge.level}`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="text-sm font-medium">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    onClick={updatePassword}
                    disabled={!newPassword || !confirmPassword || saving}
                    className="mt-4"
                  >
                    <Key size={16} className="mr-2" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
