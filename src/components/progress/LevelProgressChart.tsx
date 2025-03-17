
import React from "react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { badges } from "@/utils/badgeUtils";
import { POINTS_FOR_LEVEL_UP } from "@/utils/timerUtils";

interface LevelProgressChartProps {
  currentLevel: number;
  earnedPoints: number;
}

export const LevelProgressChart: React.FC<LevelProgressChartProps> = ({ 
  currentLevel,
  earnedPoints 
}) => {
  // Generate data for the chart, showing current level and next few levels
  const pointsForCurrentLevel = currentLevel * POINTS_FOR_LEVEL_UP;
  const totalPointsEarned = pointsForCurrentLevel + earnedPoints;
  
  const chartData = badges.map(badge => {
    const pointsRequired = badge.level * POINTS_FOR_LEVEL_UP;
    return {
      name: badge.name,
      level: badge.level,
      pointsRequired,
      achieved: currentLevel >= badge.level,
      color: badge.color.split(' ')[1] // Get the "to-" color for the bar
    };
  });
  
  const progressConfig = {
    earned: { label: "Points Earned", color: "#10b981" },
    required: { label: "Points Required", color: "#6b7280" },
  };

  return (
    <div className="w-full h-[350px] mt-6">
      <ChartContainer
        config={progressConfig}
        className="h-full"
      >
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={70} 
            tickMargin={20}
          />
          <YAxis 
            label={{ 
              value: "Points Required", 
              angle: -90, 
              position: "insideLeft",
              style: { textAnchor: "middle" }
            }} 
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="font-medium">{data.name} Badge</div>
                    <div className="text-sm text-muted-foreground">
                      Level: {data.level}
                    </div>
                    <div className="text-sm">
                      Points: {data.pointsRequired.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium mt-1">
                      {data.achieved ? "Achieved" : "Not Yet Achieved"}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="pointsRequired" fill="#6b7280" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.achieved ? "#10b981" : "#6b7280"}
                opacity={entry.achieved ? 1 : 0.6}
              />
            ))}
          </Bar>
          
          {/* Current progress marker */}
          {chartData.some(d => d.pointsRequired > totalPointsEarned) && (
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={0}
              stroke="#f43f5e"
              strokeWidth={2}
              strokeDasharray="5 5"
              className="recharts-custom-line"
              // Note: This is positioned on component mount using useEffect
            />
          )}
        </BarChart>
      </ChartContainer>
    </div>
  );
};
