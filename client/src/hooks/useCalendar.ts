import { useQuery } from '@tanstack/react-query';
import { 
  getCalendarEvents, 
  getMonthlyCalendarEvents, 
  getCurrentMonthEvents,
  getMonthDateRange 
} from '@/services/api/calendar';
import type { CalendarEventsParams } from '@/types';

// Query keys for calendar data
const CALENDAR_QUERY_KEYS = {
  all: ['calendar'] as const,
  events: () => [...CALENDAR_QUERY_KEYS.all, 'events'] as const,
  eventsWithParams: (params?: CalendarEventsParams) => 
    [...CALENDAR_QUERY_KEYS.events(), params] as const,
  monthlyEvents: (year: number, month: number) => 
    [...CALENDAR_QUERY_KEYS.events(), 'monthly', year, month] as const,
  currentMonth: () => [...CALENDAR_QUERY_KEYS.events(), 'currentMonth'] as const,
};

/**
 * Hook to fetch all calendar events with optional date range filtering
 */
export const useCalendarEvents = (params?: CalendarEventsParams) => {
  return useQuery({
    queryKey: CALENDAR_QUERY_KEYS.eventsWithParams(params),
    queryFn: () => getCalendarEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch calendar events for a specific month and year
 */
export const useMonthlyCalendarEvents = (year: number, month: number, enabled = true) => {
  return useQuery({
    queryKey: CALENDAR_QUERY_KEYS.monthlyEvents(year, month),
    queryFn: () => getMonthlyCalendarEvents(year, month),
    enabled: enabled && !isNaN(year) && !isNaN(month) && month >= 1 && month <= 12,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch calendar events for the current month
 */
export const useCurrentMonthCalendarEvents = () => {
  return useQuery({
    queryKey: CALENDAR_QUERY_KEYS.currentMonth(),
    queryFn: getCurrentMonthEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch calendar events for a date range based on current calendar view
 * This is useful for calendar components that need to show events for a specific time period
 */
export const useCalendarViewEvents = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  
  // Get the first and last day of the month for the calendar view
  const { start_date, end_date } = getMonthDateRange(year, month);
  
  return useQuery({
    queryKey: CALENDAR_QUERY_KEYS.eventsWithParams({ start_date, end_date }),
    queryFn: () => getCalendarEvents({ start_date, end_date }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Helper hook for calendar navigation - preloads adjacent months
 */
export const useCalendarNavigation = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  
  // Current month
  const currentQuery = useMonthlyCalendarEvents(year, month);
  
  // Previous month
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevQuery = useMonthlyCalendarEvents(prevYear, prevMonth, false); // Don't auto-fetch
  
  // Next month  
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextQuery = useMonthlyCalendarEvents(nextYear, nextMonth, false); // Don't auto-fetch
  
  return {
    current: currentQuery,
    previous: prevQuery,
    next: nextQuery,
    prefetchPrevious: () => prevQuery.refetch(),
    prefetchNext: () => nextQuery.refetch(),
  };
};

// Export query keys for external invalidation
export { CALENDAR_QUERY_KEYS };