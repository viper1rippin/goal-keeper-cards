
import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, UserCog, Eye, EyeOff, Upload } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    avatarUrl: '',
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    avatar: false,
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      
      setProfileData({
        displayName: data?.display_name || '',
        avatarUrl: data?.avatar_url || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profileData.displayName,
          updated_at: new Date().toISOString(), // Convert Date to string
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;
    
    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, password: true }));
      
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });
      
      if (error) throw error;
      
      setPasswords({
        current: '',
        new: '',
        confirm: '',
      });
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully'
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setAvatarFile(file);
  };

  const handleUploadAvatar = async () => {
    if (!user || !avatarFile) return;
    
    try {
      setLoading(prev => ({ ...prev, avatar: true }));
      
      // Create a unique file path
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(), // Convert Date to string
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        avatarUrl: data.publicUrl,
      }));
      
      setAvatarFile(null);
      setAvatarPreview(null);
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload profile picture',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, avatar: false }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="profile" className="data-[state=active]:bg-emerald data-[state=active]:text-slate-900">
              <User size={16} className="mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-emerald data-[state=active]:text-slate-900">
              <UserCog size={16} className="mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-slate-800/50 border-slate-700 col-span-2">
                <h2 className="text-xl font-semibold mb-4 text-white">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                      className="bg-slate-900/50 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-slate-900/80 border-slate-700 text-slate-400"
                    />
                    <p className="text-sm text-slate-400 mt-1">Email cannot be changed</p>
                  </div>
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={loading.profile}
                    className="bg-emerald hover:bg-emerald-dark text-slate-900 font-medium"
                  >
                    {loading.profile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6 bg-slate-800/50 border-slate-700 h-fit">
                <h2 className="text-xl font-semibold mb-4 text-white">Profile Picture</h2>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32 border-4 border-emerald/20">
                    <AvatarImage 
                      src={avatarPreview || profileData.avatarUrl} 
                      alt="Profile" 
                    />
                    <AvatarFallback className="bg-emerald/20 text-emerald text-2xl">
                      {profileData.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <Label 
                    htmlFor="avatar-upload" 
                    className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-md flex items-center justify-center w-full"
                  >
                    <Upload size={16} className="mr-2" />
                    Choose Image
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  
                  {avatarPreview && (
                    <Button 
                      onClick={handleUploadAvatar}
                      disabled={loading.avatar}
                      className="w-full bg-emerald hover:bg-emerald-dark text-slate-900 font-medium"
                    >
                      {loading.avatar ? 'Uploading...' : 'Upload New Picture'}
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="security">
            <Card className="p-6 bg-slate-800/50 border-slate-700 max-w-xl">
              <h2 className="text-xl font-semibold mb-4 text-white">Change Password</h2>
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword.current ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      className="bg-slate-900/50 border-slate-700 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-white"
                    >
                      {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword.new ? 'text' : 'password'}
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="bg-slate-900/50 border-slate-700 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-white"
                    >
                      {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="bg-slate-900/50 border-slate-700 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-white"
                    >
                      {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={handleUpdatePassword}
                  disabled={loading.password || !passwords.new || !passwords.confirm}
                  className="bg-emerald hover:bg-emerald-dark text-slate-900 font-medium"
                >
                  {loading.password ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
