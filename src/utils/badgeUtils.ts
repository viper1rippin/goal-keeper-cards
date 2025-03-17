
import { Award, Shield, Sword, Trophy, Crown, Target, Flag, UserRound } from "lucide-react";

export interface Badge {
  name: string;
  level: number;
  icon: typeof Award;
  color: string;
}

// Badge definitions based on user levels
export const badges: Badge[] = [
  { name: "Peasant", level: 1, icon: UserRound, color: "from-gray-400 to-gray-600" },
  { name: "Soldier", level: 10, icon: Target, color: "from-blue-400 to-blue-600" },
  { name: "Knight", level: 20, icon: Sword, color: "from-emerald to-green-600" },
  { name: "Hero", level: 45, icon: Shield, color: "from-purple-400 to-purple-600" },
  { name: "General", level: 70, icon: Trophy, color: "from-yellow-400 to-yellow-600" },
  { name: "Commander", level: 100, icon: Award, color: "from-orange-400 to-orange-600" },
  { name: "King", level: 120, icon: Crown, color: "from-pink-400 to-pink-600" },
  { name: "Emperor", level: 200, icon: Flag, color: "from-red-400 to-red-600" }
];

// Get current badge based on user level
export const getCurrentBadge = (level: number): Badge => {
  // Find the highest badge the user qualifies for
  for (let i = badges.length - 1; i >= 0; i--) {
    if (level >= badges[i].level) {
      return badges[i];
    }
  }
  // Default badge if below all levels (should never happen now with Peasant)
  return badges[0];
};

// Get next badge based on user level
export const getNextBadge = (level: number): Badge | null => {
  // Find the next badge the user is working towards
  for (let i = 0; i < badges.length; i++) {
    if (level < badges[i].level) {
      return badges[i];
    }
  }
  // No next badge if user has reached the highest level
  return null;
};

// Points needed for next level - 24 hours of focus time
// 24 hours = 1440 minutes = 1440 points
export const POINTS_FOR_LEVEL_UP = 1440;
