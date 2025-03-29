
import { useState } from 'react';
import { TimelineViewMode } from '../types';
import { getDaysInMonth } from 'date-fns';

export const useTimelineNavigation = (viewMode: TimelineViewMode) => {
  const [months] = useState([
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const getDaysInCurrentMonth = () => {
    const daysCount = getDaysInMonth(new Date(currentYear, currentMonth));
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };
  
  // Get time units based on view mode
  const getTimeUnits = () => {
    switch (viewMode) {
      case 'month':
        return getDaysInCurrentMonth();
      case 'year':
        return months;
      default:
        return months;
    }
  };
  
  const timeUnits = getTimeUnits();
  const timeUnitCount = timeUnits.length;
  
  const navigatePrevious = () => {
    if (viewMode === 'month') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      setCurrentYear(currentYear - 1);
    }
  };
  
  const navigateNext = () => {
    if (viewMode === 'month') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      setCurrentYear(currentYear + 1);
    }
  };
  
  return {
    months,
    currentMonth,
    currentYear,
    timeUnits,
    timeUnitCount,
    navigatePrevious,
    navigateNext
  };
};
