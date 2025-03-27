
import { differenceInMonths, differenceInQuarters } from 'date-fns';
import { TimelineViewMode } from '../types';

/**
 * Calculates the start position in the timeline based on the date and view mode
 */
export const calculateStartPosition = (date: Date, viewMode: TimelineViewMode): number => {
  if (viewMode === 'month') {
    return date.getMonth();
  } else if (viewMode === 'year') {
    return Math.floor(date.getMonth() / 3);
  }
  return 0;
};

/**
 * Calculates the duration in the timeline based on start and end dates and view mode
 */
export const calculateDuration = (startDate: Date, endDate: Date, viewMode: TimelineViewMode): number => {
  if (viewMode === 'month') {
    const monthsDiff = differenceInMonths(endDate, startDate);
    return Math.max(1, monthsDiff + 1);
  } else if (viewMode === 'year') {
    const quartersDiff = differenceInQuarters(endDate, startDate);
    return Math.max(1, quartersDiff + 1);
  }
  return 1;
};

/**
 * Returns the label for the timeline units based on view mode
 */
export const getTimeUnitLabel = (viewMode: TimelineViewMode): string => {
  switch (viewMode) {
    case 'month':
      return 'months';
    case 'year':
      return 'quarters';
    default:
      return 'months';
  }
};
