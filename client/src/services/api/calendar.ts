import { api } from './index';
import type { CalendarEventsResponse, CalendarEventsParams } from '@/types';

/**
 * Get all calendar events with optional date range
 */
export const getCalendarEvents = async (params?: CalendarEventsParams): Promise<CalendarEventsResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params?.start_date) {
    searchParams.append('start_date', params.start_date);
  }
  
  if (params?.end_date) {
    searchParams.append('end_date', params.end_date);
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/calendar/events?${queryString}` : '/calendar/events';
  
  const response = await api.get(url);
  return response.data;
};

/**
 * Get calendar events for a specific month and year
 */
export const getMonthlyCalendarEvents = async (year: number, month: number): Promise<CalendarEventsResponse> => {
  const response = await api.get(`/calendar/events/${year}/${month}`);
  return response.data;
};

/**
 * Helper function to get events for current month
 */
export const getCurrentMonthEvents = async (): Promise<CalendarEventsResponse> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  return getMonthlyCalendarEvents(year, month);
};

/**
 * Helper function to format date for API calls
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Helper function to get date range for a specific month
 */
export const getMonthDateRange = (year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return {
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate)
  };
};