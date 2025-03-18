
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { POINTS_PER_MINUTE } from "@/utils/timerUtils";
import { getCurrentBadge, getNextBadge, badges, POINTS_FOR_LEVEL_UP } from "@/utils/badgeUtils";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Timer, Target, Flag } from "lucide-react";
import { formatTime, calculateTimeForNextLevel, calculateDaysForNextBadge, pointsToHours } from "@/utils/timerUtils";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";

const ProgressTracker = () => {
  const { user } = useAuth();
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Calculate points needed for next level
  const pointsForNextLevel = POINTS_FOR_LEVEL_UP;
  const progressPercentage = Math.min(100, (points / pointsForNextLevel) * 100);
  
  // Get current and next badge
  const currentBadge = getCurrentBadge(level);
  const nextBadge = getNextBadge(level);
  
  // Calculate time needed for next level
  const hoursForNextLevel = calculateTimeForNextLevel(points, pointsForNextLevel);
  
  // Calculate days needed for next badge
  const daysForNextBadge = nextBadge ? calculateDaysForNextBadge(level, nextBadge.level) : 0;
  
  // Convert points to hours for display
  const hoursCompleted = pointsToHours(points);
  const hoursNeededForLevel = pointsToHours(pointsForNextLevel);

  useEffect(() => {
    if (user) {
      const fetchUserProgress = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('level, points')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user progress:', error);
            return;
          }
          
          if (data) {
            setLevel(data.level || 1);
            setPoints(data.points || 0);
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserProgress();
    }
  }, [user]);
  
  // Data for badges chart - use actual level requirements from badges array
  const badgesChartData = badges.map(badge => ({
    name: badge.name,
    level: badge.level,
    current: level >= badge.level ? 'Unlocked' : 'Locked',
  }));
  
  // Data for level progress chart
  const levelProgressData = [
    { name: 'Hours Completed', hours: hoursCompleted, fill: '#10b981' },
    { name: 'Hours Remaining', hours: Math.max(0, hoursNeededForLevel - hoursCompleted), fill: '#1f2937' }
  ];
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Progress Tracker</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading your progress...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* User Level Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-emerald" />
                    Your Progress
                  </CardTitle>
                  <CardDescription>
                    Track your journey to becoming an Emperor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-6">
                    <Avatar className="h-16 w-16 mr-4">
                      <AvatarImage src={null} />
                      <AvatarFallback className={`bg-gradient-to-r ${currentBadge.color} text-white text-xl font-bold`}>
                        {level}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">Level {level}</h3>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          <currentBadge.icon className="h-3 w-3 mr-1" />
                          {currentBadge.name}
                        </Badge>
                        {nextBadge && (
                          <p className="text-sm text-muted-foreground">
                            Next badge: {nextBadge.name} at level {nextBadge.level}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{hoursCompleted} hours completed</span>
                      <span>{hoursNeededForLevel} hours needed for level {level + 1}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      <Timer className="inline h-4 w-4 mr-1" />
                      {hoursForNextLevel} more hours of focus time needed for next level
                    </p>
                    {nextBadge && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <Target className="inline h-4 w-4 mr-1" />
                        {daysForNextBadge} days of focus time needed for {nextBadge.name} badge
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Tabs for different views */}
              <Tabs defaultValue="badges">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="badges">Badge Progression</TabsTrigger>
                  <TabsTrigger value="levels">Level Details</TabsTrigger>
                </TabsList>
                
                {/* Badge Progress Tab */}
                <TabsContent value="badges" className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Badge Progression</CardTitle>
                      <CardDescription>
                        Your journey through the badge levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Visual Badge Progression Chart */}
                      <div className="relative h-96 mb-6">
                        <h3 className="text-xl font-bold mb-1">Badge Progression</h3>
                        <p className="text-sm text-muted-foreground mb-6">Your journey through the badge levels</p>
                        
                        <div className="h-64">
                          <ChartContainer 
                            config={{
                              level: { theme: { light: '#10b981', dark: '#10b981' } },
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={badgesChartData}
                                margin={{ top: 20, right: 30, left: 30, bottom: 60 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                <XAxis 
                                  dataKey="name" 
                                  angle={0} 
                                  textAnchor="middle"
                                  height={50}
                                  tick={{ fontSize: 10 }}
                                  tickLine={false}
                                />
                                <YAxis 
                                  label={{ value: 'Level Required', angle: -90, position: 'insideLeft', offset: -15 }} 
                                  domain={[0, 210]}
                                  ticks={[0, 50, 100, 150, 200]}
                                />
                                <Tooltip 
                                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      const isUnlocked = level >= data.level;
                                      return (
                                        <div className="rounded-lg border bg-background p-2 shadow-md">
                                          <p className="font-semibold">{data.name} Badge</p>
                                          <p>Required Level: {data.level}</p>
                                          <p className={isUnlocked ? 'text-emerald' : 'text-muted-foreground'}>
                                            Status: {isUnlocked ? 'Unlocked' : 'Locked'}
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar 
                                  dataKey="level" 
                                  fill="#10b981" 
                                  radius={[4, 4, 0, 0]}
                                  className="cursor-pointer"
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </div>
                      
                      {/* Badge Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                        {badges.map((badge) => {
                          const isUnlocked = level >= badge.level;
                          const BadgeIcon = badge.icon;
                          
                          return (
                            <Card 
                              key={badge.name} 
                              className={`border ${isUnlocked ? 'border-emerald/40' : 'border-slate-800'} overflow-hidden`}
                            >
                              <CardContent className="p-0">
                                <div className="flex flex-col h-full">
                                  {/* Badge icon and level */}
                                  <div className={`flex items-center justify-between p-3 ${isUnlocked ? `bg-gradient-to-r ${badge.color} bg-opacity-10` : 'bg-slate-900'}`}>
                                    <div className="flex items-center">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${isUnlocked ? `bg-gradient-to-r ${badge.color}` : 'bg-slate-800'}`}>
                                        <BadgeIcon className="h-4 w-4 text-white" />
                                      </div>
                                      <span className="font-medium text-sm">{badge.name}</span>
                                    </div>
                                    <Badge variant="compact" className={isUnlocked ? 'bg-emerald/20 text-emerald' : 'bg-slate-800'}>
                                      Level {badge.level}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Level Details Tab */}
                <TabsContent value="levels" className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Level Progress</CardTitle>
                      <CardDescription>
                        Your progress toward level {level + 1}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <ChartContainer 
                          config={{
                            current: { theme: { light: '#10b981', dark: '#10b981' } },
                            remaining: { theme: { light: '#1f2937', dark: '#1f2937' } },
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={levelProgressData}
                              layout="vertical"
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                              <XAxis type="number" domain={[0, hoursNeededForLevel]} />
                              <YAxis dataKey="name" type="category" width={120} />
                              <Tooltip 
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="rounded-lg border bg-background p-2 shadow-md">
                                        <p className="font-semibold">{payload[0].payload.name}</p>
                                        <p>{payload[0].value} hours</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Legend />
                              <Bar dataKey="hours" fill="#10b981" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Hours of Focus Required</span>
                            <span>{pointsToHours(POINTS_FOR_LEVEL_UP)} hours per level</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Each minute of focus time counts toward your progress. You need {pointsToHours(POINTS_FOR_LEVEL_UP)} hours to advance to the next level.</p>
                        </div>
                        
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Your Stats</span>
                            <span>{formatTime(points * 60)} total focus time</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-emerald" />
                            <p className="text-sm">You are {Math.floor(progressPercentage)}% of the way to level {level + 1}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Flag className="h-4 w-4 text-emerald" />
                            <p className="text-sm">Approximately {hoursForNextLevel} more hours of focus needed</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
