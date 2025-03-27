
import React from 'react';
import { TimelineViewMode } from './types';

interface TimelineHeaderProps {
  months: string[];
  timeUnits: (string | number)[];
  cellWidth: number;
  currentMonth: number;
  currentYear: number;
  viewMode: TimelineViewMode;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  months,
  timeUnits,
  cellWidth,
  currentMonth,
  currentYear,
  viewMode,
  onNavigatePrevious,
  onNavigateNext
}) => {
  const getHeaderLabel = () => {
    switch (viewMode) {
      case 'month':
        return `${months[currentMonth]} ${currentYear}`;
      case 'year':
        return `${currentYear}`;
      default:
        return `${months[currentMonth]} ${currentYear}`;
    }
  };

  return (
    <div className="border-b border-slate-800 p-2 bg-slate-800/50">
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={onNavigatePrevious}
          className="px-2 py-1 rounded hover:bg-slate-700 transition-colors"
        >
          &lt;
        </button>
        <h3 className="text-sm font-medium text-slate-300">{getHeaderLabel()}</h3>
        <button 
          onClick={onNavigateNext}
          className="px-2 py-1 rounded hover:bg-slate-700 transition-colors"
        >
          &gt;
        </button>
      </div>
      <div className="flex">
        {timeUnits.map((unit, idx) => (
          <div 
            key={`unit-${idx}`}
            className="text-center text-xs font-medium text-slate-300"
            style={{ minWidth: `${cellWidth}px`, flexGrow: 1 }}
          >
            {unit}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineHeader;
