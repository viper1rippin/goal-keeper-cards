
import { differenceInMonths, differenceInQuarters, differenceInDays, addDays, addMonths } from 'date-fns';
import { TimelineViewMode, SubGoalTimelineItem } from '../types';

/**
 * Calculates the start position in the timeline based on the date and view mode
 */
export const calculateStartPosition = (date: Date, viewMode: TimelineViewMode, currentMonth?: number, currentYear?: number): number => {
  // For absolute positioning within the current view
  if (viewMode === 'month' && currentMonth !== undefined && currentYear !== undefined) {
    // If the date is in the current month and year, calculate its position
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      return date.getDate() - 1; // Convert from 1-based days to 0-based index
    }
    // If date is not in the current month view, place at beginning
    return 0;
  } else if (viewMode === 'month') {
    // Without current month context, just return day of month
    return date.getDate() - 1;
  } else if (viewMode === 'year') {
    // For year view, if within the current year
    if (currentYear !== undefined) {
      if (date.getFullYear() === currentYear) {
        return date.getMonth(); // Months are 0-based
      }
      // If not in current year, place at beginning
      return 0;
    }
    // Without year context, just return month
    return date.getMonth(); 
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
 * Updates the start/end dates based on timeline position
 */
export const updateDatesFromTimelinePosition = (
  start: number, 
  duration: number, 
  currentYear: number, 
  currentMonth: number, 
  viewMode: TimelineViewMode
): { startDate: Date, endDate: Date } => {
  const startDate = new Date(currentYear, currentMonth);
  
  if (viewMode === 'month') {
    // In month view, start represents the day (0-indexed)
    startDate.setDate(start + 1); // Convert 0-indexed to day of month
  } else if (viewMode === 'year') {
    // In year view, start represents the month (already 0-indexed)
    startDate.setMonth(start);
    startDate.setDate(1); // First day of month
  }
  
  // Calculate end date based on duration
  const endDate = calculateEndDateFromDurationChange(
    startDate,
    0, // Current duration doesn't matter as we're setting a new one
    duration, 
    viewMode
  );
  
  return { startDate, endDate };
};

/**
 * Synchronizes timeline position with actual dates
 */
export const syncTimelineItemWithDates = (
  item: SubGoalTimelineItem,
  currentYear: number,
  currentMonth: number,
  viewMode: TimelineViewMode
): SubGoalTimelineItem => {
  if (item.startDate && item.endDate) {
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);
    
    // Calculate the start position based on the date
    const newStart = calculateStartPosition(startDate, viewMode, currentMonth, currentYear);
    
    // Calculate duration based on dates
    const newDuration = calculateDuration(startDate, endDate, viewMode);
    
    return {
      ...item,
      start: newStart,
      duration: newDuration
    };
  }
  
  return item;
};

/**
 * Calculate cell position from pixel coordinates
 */
export const calculateCellFromPosition = (
  x: number, 
  cellWidth: number, 
  timeUnitCount: number
): number => {
  // Calculate which cell this position corresponds to
  const cell = Math.floor(x / cellWidth);
  
  // Ensure cell is within bounds
  return Math.max(0, Math.min(timeUnitCount - 1, cell));
};

/**
 * Calculate row position from pixel coordinates
 */
export const calculateRowFromPosition = (
  y: number, 
  rowHeight: number, 
  maxRows: number
): number => {
  // Calculate which row this position corresponds to
  const row = Math.floor(y / rowHeight);
  
  // Ensure row is within bounds
  return Math.max(0, Math.min(maxRows - 1, row));
};
