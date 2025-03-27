
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
 * Calculates a new start date based on the new position in the timeline
 */
export const calculateNewStartDate = (
  currentStartDate: Date,
  newStartPosition: number,
  viewMode: TimelineViewMode,
  year: number,
  month: number
): Date => {
  const newDate = new Date(currentStartDate);
  
  if (viewMode === 'month') {
    // Set the new date to the correct year and month
    newDate.setFullYear(year);
    newDate.setMonth(month);
    // Set the day based on the new position (adding 1 because days are 1-indexed)
    newDate.setDate(newStartPosition + 1);
  } else if (viewMode === 'year') {
    // Set the year
    newDate.setFullYear(year);
    // Set the month based on the new position
    newDate.setMonth(newStartPosition);
  }
  
  return newDate;
};

/**
 * Calculates both new start and end dates when an item is moved
 */
export const calculateNewDates = (
  currentStartDate: Date,
  currentEndDate: Date,
  newStartPosition: number,
  viewMode: TimelineViewMode,
  year: number,
  month: number
): { newStartDate: Date, newEndDate: Date } => {
  // Calculate the new start date
  const newStartDate = calculateNewStartDate(
    currentStartDate,
    newStartPosition,
    viewMode,
    year,
    month
  );
  
  // Maintain the same duration between start and end dates
  const currentDuration = calculateDuration(currentStartDate, currentEndDate, viewMode);
  const newEndDate = calculateEndDateFromDurationChange(
    newStartDate,
    0, // Not used in this calculation
    currentDuration,
    viewMode
  );
  
  return { newStartDate, newEndDate };
};
