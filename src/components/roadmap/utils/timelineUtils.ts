
import { differenceInMonths, differenceInQuarters, differenceInDays, addDays, addMonths } from 'date-fns';
import { TimelineViewMode } from '../types';

/**
 * Calculates the start position in the timeline based on the date and view mode
 */
export const calculateStartPosition = (date: Date, viewMode: TimelineViewMode): number => {
  if (viewMode === 'month') {
    return date.getDate() - 1; // Convert from 1-based days to 0-based index
  } else if (viewMode === 'year') {
    return date.getMonth(); // Months are already 0-based
  }
  return 0;
};

/**
 * Calculates the duration in the timeline based on start and end dates and view mode
 */
export const calculateDuration = (startDate: Date, endDate: Date, viewMode: TimelineViewMode): number => {
  if (viewMode === 'month') {
    // For month view, calculate days difference
    const daysDiff = differenceInDays(endDate, startDate);
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
    return addDays(startDate, newDuration - 1);
  } else if (viewMode === 'year') {
    // In year view, duration is in months
    return addMonths(startDate, newDuration - 1);
  }
  
  return endDate;
};

/**
 * Updates the start and end dates based on timeline position changes
 */
export const updateDatesFromTimelinePosition = (
  item: { start: number; duration: number; startDate?: string; endDate?: string },
  viewMode: TimelineViewMode,
  year: number,
  month: number
): { startDate: string; endDate: string } => {
  // Create base date from current view context
  const baseDate = new Date(year, month, 1);
  
  // Calculate new start date
  const startDate = new Date(baseDate);
  if (viewMode === 'month') {
    // In month view, position is day of month (0-based to 1-based)
    startDate.setDate(item.start + 1);
  } else if (viewMode === 'year') {
    // In year view, position is month (already 0-based)
    startDate.setMonth(item.start);
  }
  
  // Calculate end date based on duration
  const endDate = calculateEndDateFromDurationChange(
    startDate,
    1, // Not using current duration, just calculating from start
    item.duration,
    viewMode
  );
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};
