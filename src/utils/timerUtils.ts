
// Format time as HH:MM:SS to better display long focus sessions
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Points earned per minute of focus
// 24 hours = 1440 minutes, so we need 1440 points for a level up
// 1 point per minute = 1440 points per day = 1 level per day (24 hours)
export const POINTS_PER_MINUTE = 1;

// Calculate points needed for next level
export const getPointsForNextLevel = (level: number) => {
  // Each level requires 24 hours (1440 minutes) of focus time
  return 1440;
};

// Calculate time needed for next level (in hours)
export const calculateTimeForNextLevel = (earnedPoints: number, pointsForNextLevel: number) => {
  const minutesForNextLevel = Math.ceil((pointsForNextLevel - earnedPoints) / POINTS_PER_MINUTE);
  const hoursForNextLevel = Math.ceil(minutesForNextLevel / 60);
  return hoursForNextLevel;
};
