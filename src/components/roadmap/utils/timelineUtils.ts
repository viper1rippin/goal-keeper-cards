
import { differenceInMonths, differenceInQuarters, differenceInDays, addDays, addMonths } from 'date-fns';
import { TimelineViewMode } from '../types';

/**
 * Calculates the start position in the timeline based on the date and view mode
 */
export const calculateStartPosition = (date: Date, viewMode: TimelineViewMode, currentMonth?: number, currentYear?: number): number => {
  if (viewMode === 'month' && currentMonth !== undefined && currentYear !== undefined) {
    // If the date is not in the current month/year, return -1 to indicate it's out of range
    if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) {
      return -1;
    }
    return date.getDate() - 1; // Convert from 1-based days to 0-based index
  } else if (viewMode === 'year') {
    return date.getMonth(); // Months are already 0-based
  }
  return 0;
};

/**
 * Calculates the duration in the timeline based on start and end dates and view mode
 */
export const calculateDuration = (startDate: Date, endDate: Date, viewMode: TimelineViewMode, currentMonth?: number, currentYear?: number): number => {
  if (viewMode === 'month' && currentMonth !== undefined && currentYear !== undefined) {
    const normalizedStartDate = new Date(startDate);
    const normalizedEndDate = new Date(endDate);
    
    // Adjust dates if they fall outside the current month/year view
    if (normalizedStartDate.getMonth() !== currentMonth || normalizedStartDate.getFullYear() !== currentYear) {
      normalizedStartDate.setDate(1);
      normalizedStartDate.setMonth(currentMonth);
      normalizedStartDate.setFullYear(currentYear);
    }
    
    // Ensure end date doesn't exceed the current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    if (normalizedEndDate.getMonth() !== currentMonth || normalizedEndDate.getFullYear() !== currentYear) {
      normalizedEndDate.setDate(lastDayOfMonth);
      normalizedEndDate.setMonth(currentMonth);
      normalizedEndDate.setFullYear(currentYear);
    }
    
    // Calculate days difference
    const daysDiff = differenceInDays(normalizedEndDate, normalizedStartDate);
    return Math.max(1, daysDiff + 1);
  } else if (viewMode === 'year') {
    // For year view, calculate months difference
    const monthsDiff = differenceInMonths(endDate, startDate);
    return Math.max(1, monthsDiff + 1);
  }
  return 1;
};

/**
 * Returns the label for the timeline units based on view mode
 */
export const getTimeUnitLabel = (viewMode: TimelineViewMode): string => {
  switch (viewMode) {
    case 'month':
      return 'days';
    case 'year':
      return 'months';
    default:
      return 'days';
  }
};

/**
 * Calculates the new end date based on the increased or decreased duration
 */
export const calculateEndDateFromDurationChange = (
  startDate: Date, 
  currentDuration: number, 
  newDuration: number, 
  viewMode: TimelineViewMode
): Date => {
  const endDate = new Date(startDate);
  
  if (viewMode === 'month') {
    // In month view, duration is in days
    endDate.setDate(startDate.getDate() + newDuration - 1);
  } else if (viewMode === 'year') {
    // In year view, duration is in months
    endDate.setMonth(startDate.getMonth() + newDuration - 1);
    // Keep the same day of month but account for months with fewer days
    const maxDaysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
    if (startDate.getDate() > maxDaysInMonth) {
      endDate.setDate(maxDaysInMonth);
    } else {
      endDate.setDate(startDate.getDate());
    }
  }
  
  return endDate;
};

/**
 * Formats a start-end date range for display
 */
export const formatDateRange = (startDate: Date, endDate: Date, viewMode: TimelineViewMode): string => {
  if (viewMode === 'month') {
    return `${startDate.getDate()} - ${endDate.getDate()}`;
  } else if (viewMode === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[startDate.getMonth()]} - ${months[endDate.getMonth()]}`;
  }
  return '';
};

/**
 * Determines if an item should be visible in the current month/year view
 */
export const isItemVisibleInCurrentView = (
  startDate: Date | undefined, 
  endDate: Date | undefined, 
  currentMonth: number, 
  currentYear: number
): boolean => {
  if (!startDate || !endDate) return true;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Item starts before current month/year but extends into it
  const startsBeforeButExtendsInto = 
    (start.getFullYear() < currentYear || 
     (start.getFullYear() === currentYear && start.getMonth() < currentMonth)) && 
    (end.getFullYear() > currentYear || 
     (end.getFullYear() === currentYear && end.getMonth() >= currentMonth));
  
  // Item starts in current month/year
  const startsInCurrentMonthYear = 
    start.getFullYear() === currentYear && 
    start.getMonth() === currentMonth;
  
  // Item ends in current month/year
  const endsInCurrentMonthYear = 
    end.getFullYear() === currentYear && 
    end.getMonth() === currentMonth;
  
  // Item spans over current month/year (starts before and ends after)
  const spansOverCurrentMonthYear =
    (start.getFullYear() < currentYear || 
     (start.getFullYear() === currentYear && start.getMonth() < currentMonth)) &&
    (end.getFullYear() > currentYear || 
     (end.getFullYear() === currentYear && end.getMonth() > currentMonth));
    
  return startsInCurrentMonthYear || endsInCurrentMonthYear || spansOverCurrentMonthYear || startsBeforeButExtendsInto;
};

