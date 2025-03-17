
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Lock, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import { Label } from "@/components/ui/label";
import Footer from "@/components/Footer";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      
      // Fetch user profile data
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setDisplayName(data.display_name || "");
          setPhotoUrl(data.avatar_url);
        }
      };
      
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-apple-dark">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  const handleGoBack = () => {
    navigate("/");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}-${Date.now()}.${fileExt}`;

    setUploading(true);

    try {
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setPhotoUrl(data.publicUrl);
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update profile photo.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      // Update display name in profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update password if provided
      if (password) {
        if (password !== confirmPassword) {
          toast({
            variant: "destructive",
            title: "Passwords don't match",
            description: "Please make sure your passwords match.",
          });
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: password
        });

        if (passwordError) throw passwordError;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update profile.",
      });
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen flex bg-apple-dark">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <div className={`transition-all duration-300 flex-1 flex flex-col ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="flex-1 flex flex-col items-center p-6">
          <div className="w-full max-w-3xl">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoBack}
                className="mr-2"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Home
              </Button>
              <h1 className="text-xl font-semibold text-white">Profile Settings</h1>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <div className="flex flex-col items-center mb-6">
                <div className="mb-4 relative">
                  <Avatar className="w-24 h-24 border-2 border-emerald">
                    {photoUrl ? (
                      <AvatarImage src={photoUrl} alt="Profile" />
                    ) : (
                      <AvatarFallback className="bg-emerald text-white text-2xl">
                        {getInitials(displayName || email)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-emerald hover:bg-emerald-dark text-white p-1.5 rounded-full cursor-pointer">
                    <Upload size={16} />
                    <input 
                      id="photo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-sm text-slate-400">
                  {uploading ? "Uploading..." : "Click the icon to upload a new photo"}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="display-name">Display Name</Label>
                  <div className="mt-1">
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      rightElement={<User className="text-slate-400" size={16} />}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      value={email}
                      disabled
                      placeholder="Your email"
                      rightElement={<Mail className="text-slate-400" size={16} />}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="password">New Password</Label>
                  <div className="mt-1">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      rightElement={<Lock className="text-slate-400" size={16} />}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="mt-1">
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      rightElement={<Lock className="text-slate-400" size={16} />}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSaveProfile} 
                    className="w-full bg-emerald hover:bg-emerald-dark"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Profile;
