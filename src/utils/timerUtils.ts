
// Constants for level calculations
import { POINTS_FOR_LEVEL_UP } from "./badgeUtils";

// Points per minute of focus time
export const POINTS_PER_MINUTE = 1;

// Export POINTS_FOR_LEVEL_UP so it can be used in other components
export { POINTS_FOR_LEVEL_UP };

// Calculate points needed for next level
export const getPointsForNextLevel = (level: number): number => {
  return POINTS_FOR_LEVEL_UP;
};

// Format time as HH:MM:SS
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Convert points to hours
export const pointsToHours = (points: number): number => {
  return points / 60;
};

// Calculate time needed for next level (in hours)
export const calculateTimeForNextLevel = (earnedPoints: number, pointsForNextLevel: number): number => {
  const minutesForNextLevel = Math.ceil((pointsForNextLevel - earnedPoints) / POINTS_PER_MINUTE);
  return Math.ceil(minutesForNextLevel / 60);
};

// Calculate days needed to reach the next badge
export const calculateDaysForNextBadge = (currentLevel: number, nextBadgeLevel: number): number => {
  if (!nextBadgeLevel || currentLevel >= nextBadgeLevel) return 0;
  
  // Calculate how many level-ups are needed
  const levelsNeeded = nextBadgeLevel - currentLevel;
  
  // Calculate total points needed - each level requires 24 hours (1440 minutes)
  const totalPointsNeeded = levelsNeeded * POINTS_FOR_LEVEL_UP;
  
  // Convert to days - 24 hours per day
  return Math.ceil(totalPointsNeeded / (POINTS_PER_MINUTE * 60 * 24));
};
