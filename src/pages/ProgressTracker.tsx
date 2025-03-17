
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Badge as UIBadge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCard } from "@/components/progress/BadgeCard";
import { ProgressOverview } from "@/components/progress/ProgressOverview";
import { LevelProgressChart } from "@/components/progress/LevelProgressChart";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { badges, Badge } from "@/utils/badgeUtils";
import { Timer, Award, ChevronRight } from "lucide-react";
import { POINTS_FOR_LEVEL_UP } from "@/utils/timerUtils";

const ProgressTracker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [earnedPoints, setEarnedPoints] = useState(0);
  
  // Fetch user profile data including level and points
  useEffect(() => {
    if (!user) return;
    
    const fetchUserProgress = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('level, points')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setUserLevel(data.level || 1);
          setEarnedPoints(data.points || 0);
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
        toast({
          variant: "destructive",
          title: "Failed to load progress",
          description: "There was a problem loading your progress data."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [user, toast]);

  // Calculate points required for next level and total accumulated points
  const pointsForNextLevel = POINTS_FOR_LEVEL_UP;
  const totalTimeInvested = userLevel * POINTS_FOR_LEVEL_UP + earnedPoints;
  const totalHours = Math.floor(totalTimeInvested / 60);

  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapseChange={setCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="container mx-auto py-6 px-4 md:px-6">
          {/* Page header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Progress Tracker</h1>
              <p className="text-muted-foreground mt-1">
                Track your focus progress and badge achievements
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <UIBadge variant="outline" className="border-emerald/50 bg-emerald/10 text-emerald">
                <Timer className="mr-1 h-3 w-3" />
                {totalHours} hours invested
              </UIBadge>
              <UIBadge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-500">
                <Award className="mr-1 h-3 w-3" />
                Level {userLevel}
              </UIBadge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <ProgressOverview 
                currentLevel={userLevel}
                currentPoints={earnedPoints}
              />
            </div>
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Total Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Hours</span>
                    <span className="font-medium">{totalHours}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Level</span>
                    <span className="font-medium">{userLevel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Points for Next Level</span>
                    <span className="font-medium">{earnedPoints} / {pointsForNextLevel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Badges Earned</span>
                    <span className="font-medium">
                      {badges.filter(badge => userLevel >= badge.level).length} / {badges.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Progress Chart</TabsTrigger>
              <TabsTrigger value="badges">Badges Collection</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle>Level Progress Chart</CardTitle>
                  <CardDescription>
                    Visualize your progress towards all badges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LevelProgressChart 
                    currentLevel={userLevel}
                    earnedPoints={earnedPoints}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="badges">
              <Card>
                <CardHeader>
                  <CardTitle>Your Badge Collection</CardTitle>
                  <CardDescription>
                    Track your earned badges and upcoming achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Default beginner badge */}
                    <BadgeCard 
                      badge={{
                        name: "Beginner",
                        level: 0,
                        icon: Timer,
                        color: "from-slate-400 to-slate-600"
                      }}
                      currentLevel={userLevel}
                      isLocked={false}
                    />
                    
                    {/* All other badges */}
                    {badges.map((badge: Badge) => (
                      <BadgeCard 
                        key={badge.name}
                        badge={badge}
                        currentLevel={userLevel}
                        isLocked={userLevel < badge.level}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
