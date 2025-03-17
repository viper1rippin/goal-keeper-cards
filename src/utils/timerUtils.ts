
// Constants for level calculations
import { POINTS_FOR_LEVEL_UP } from "./badgeUtils";

export const POINTS_PER_MINUTE = 1;

// Export POINTS_FOR_LEVEL_UP so it can be used in other components
export { POINTS_FOR_LEVEL_UP };

// Calculate points needed for next level
export const getPointsForNextLevel = (level: number): number => {
  // Each level requires 24 hours (1440 minutes) of focus time
  return POINTS_FOR_LEVEL_UP;
};

// Format time as HH:MM:SS
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Calculate time needed for next level (in hours)
export const calculateTimeForNextLevel = (earnedPoints: number, pointsForNextLevel: number): number => {
  const minutesForNextLevel = Math.ceil((pointsForNextLevel - earnedPoints) / POINTS_PER_MINUTE);
  return Math.ceil(minutesForNextLevel / 60);
};
