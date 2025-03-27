
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
 * Converts a position and duration from the timeline grid to actual dates
 * Used when dropping cards to update their dates
 */
export const calculateDatesFromPosition = (
  gridPosition: number,
  gridDuration: number,
  currentMonth: number,
  currentYear: number,
  viewMode: TimelineViewMode
): { startDate: Date, endDate: Date } => {
  const startDate = new Date(currentYear, currentMonth);
  
  if (viewMode === 'month') {
    // In month view, position is day of month (0-based)
    startDate.setDate(gridPosition + 1); // Convert from 0-based to 1-based day
    
    // Calculate end date based on duration (in days)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + gridDuration - 1);
    
    return { startDate, endDate };
  } else if (viewMode === 'year') {
    // In year view, position is month (0-based)
    startDate.setMonth(gridPosition);
    
    // Calculate end date based on duration (in months)
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + gridDuration - 1);
    
    return { startDate, endDate };
  }
  
  // Default fallback
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + gridDuration - 1);
  return { startDate, endDate };
};
