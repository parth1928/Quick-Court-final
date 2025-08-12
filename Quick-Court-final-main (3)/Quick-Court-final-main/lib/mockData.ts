import { 
  BookingTrendData, 
  EarningsData, 
  PeakHoursData, 
  ChartDataResponse 
} from '@/lib/types/chartTypes';

// Mock booking trends data for the last 30 days
export const mockBookingTrends: ChartDataResponse<BookingTrendData> = {
  data: [
    { date: '2025-01-12', bookings: 45, revenue: 2250, period: 'daily' },
    { date: '2025-01-13', bookings: 52, revenue: 2600, period: 'daily' },
    { date: '2025-01-14', bookings: 38, revenue: 1900, period: 'daily' },
    { date: '2025-01-15', bookings: 61, revenue: 3050, period: 'daily' },
    { date: '2025-01-16', bookings: 55, revenue: 2750, period: 'daily' },
    { date: '2025-01-17', bookings: 73, revenue: 3650, period: 'daily' },
    { date: '2025-01-18', bookings: 68, revenue: 3400, period: 'daily' },
    { date: '2025-01-19', bookings: 42, revenue: 2100, period: 'daily' },
    { date: '2025-01-20', bookings: 58, revenue: 2900, period: 'daily' },
    { date: '2025-01-21', bookings: 67, revenue: 3350, period: 'daily' },
    { date: '2025-01-22', bookings: 59, revenue: 2950, period: 'daily' },
    { date: '2025-01-23', bookings: 71, revenue: 3550, period: 'daily' },
    { date: '2025-01-24', bookings: 76, revenue: 3800, period: 'daily' },
    { date: '2025-01-25', bookings: 64, revenue: 3200, period: 'daily' },
    { date: '2025-01-26', bookings: 48, revenue: 2400, period: 'daily' },
    { date: '2025-01-27', bookings: 81, revenue: 4050, period: 'daily' },
    { date: '2025-01-28', bookings: 69, revenue: 3450, period: 'daily' },
    { date: '2025-01-29', bookings: 57, revenue: 2850, period: 'daily' },
    { date: '2025-01-30', bookings: 63, revenue: 3150, period: 'daily' },
    { date: '2025-01-31', bookings: 78, revenue: 3900, period: 'daily' },
    { date: '2025-02-01', bookings: 85, revenue: 4250, period: 'daily' },
    { date: '2025-02-02', bookings: 72, revenue: 3600, period: 'daily' },
    { date: '2025-02-03', bookings: 66, revenue: 3300, period: 'daily' },
    { date: '2025-02-04', bookings: 89, revenue: 4450, period: 'daily' },
    { date: '2025-02-05', bookings: 91, revenue: 4550, period: 'daily' },
    { date: '2025-02-06', bookings: 74, revenue: 3700, period: 'daily' },
    { date: '2025-02-07', bookings: 82, revenue: 4100, period: 'daily' },
    { date: '2025-02-08', bookings: 77, revenue: 3850, period: 'daily' },
    { date: '2025-02-09', bookings: 95, revenue: 4750, period: 'daily' },
    { date: '2025-02-10', bookings: 88, revenue: 4400, period: 'daily' },
  ],
  total: 2053,
  period: 'daily',
  lastUpdated: '2025-02-10T18:30:00Z'
};

// Mock weekly booking trends
export const mockWeeklyBookingTrends: ChartDataResponse<BookingTrendData> = {
  data: [
    { date: 'Week 1', bookings: 287, revenue: 14350, period: 'weekly' },
    { date: 'Week 2', bookings: 324, revenue: 16200, period: 'weekly' },
    { date: 'Week 3', bookings: 298, revenue: 14900, period: 'weekly' },
    { date: 'Week 4', bookings: 356, revenue: 17800, period: 'weekly' },
    { date: 'Week 5', bookings: 412, revenue: 20600, period: 'weekly' },
    { date: 'Week 6', bookings: 376, revenue: 18800, period: 'weekly' },
  ],
  total: 2053,
  period: 'weekly',
  lastUpdated: '2025-02-10T18:30:00Z'
};

// Mock earnings breakdown by category
export const mockEarningsData: ChartDataResponse<EarningsData> = {
  data: [
    { category: 'Tennis Courts', amount: 15680, percentage: 32.5, color: '#2563eb' },
    { category: 'Basketball Courts', amount: 12450, percentage: 25.8, color: '#059669' },
    { category: 'Soccer Fields', amount: 9870, percentage: 20.4, color: '#dc2626' },
    { category: 'Swimming Pool', amount: 6420, percentage: 13.3, color: '#7c3aed' },
    { category: 'Volleyball Courts', amount: 3890, percentage: 8.0, color: '#ea580c' },
  ],
  total: 48310,
  period: 'monthly',
  lastUpdated: '2025-02-10T18:30:00Z'
};

// Mock peak booking hours data
export const mockPeakHoursData: ChartDataResponse<PeakHoursData> = {
  data: [
    // Monday
    { hour: '06:00', bookings: 12, day: 'Monday' },
    { hour: '07:00', bookings: 18, day: 'Monday' },
    { hour: '08:00', bookings: 25, day: 'Monday' },
    { hour: '09:00', bookings: 32, day: 'Monday' },
    { hour: '10:00', bookings: 28, day: 'Monday' },
    { hour: '11:00', bookings: 22, day: 'Monday' },
    { hour: '12:00', bookings: 35, day: 'Monday' },
    { hour: '13:00', bookings: 42, day: 'Monday' },
    { hour: '14:00', bookings: 38, day: 'Monday' },
    { hour: '15:00', bookings: 45, day: 'Monday' },
    { hour: '16:00', bookings: 52, day: 'Monday' },
    { hour: '17:00', bookings: 58, day: 'Monday' },
    { hour: '18:00', bookings: 65, day: 'Monday' },
    { hour: '19:00', bookings: 72, day: 'Monday' },
    { hour: '20:00', bookings: 68, day: 'Monday' },
    { hour: '21:00', bookings: 45, day: 'Monday' },
    { hour: '22:00', bookings: 28, day: 'Monday' },
    
    // Tuesday
    { hour: '06:00', bookings: 15, day: 'Tuesday' },
    { hour: '07:00', bookings: 22, day: 'Tuesday' },
    { hour: '08:00', bookings: 28, day: 'Tuesday' },
    { hour: '09:00', bookings: 35, day: 'Tuesday' },
    { hour: '10:00', bookings: 31, day: 'Tuesday' },
    { hour: '11:00', bookings: 25, day: 'Tuesday' },
    { hour: '12:00', bookings: 38, day: 'Tuesday' },
    { hour: '13:00', bookings: 45, day: 'Tuesday' },
    { hour: '14:00', bookings: 41, day: 'Tuesday' },
    { hour: '15:00', bookings: 48, day: 'Tuesday' },
    { hour: '16:00', bookings: 55, day: 'Tuesday' },
    { hour: '17:00', bookings: 61, day: 'Tuesday' },
    { hour: '18:00', bookings: 68, day: 'Tuesday' },
    { hour: '19:00', bookings: 75, day: 'Tuesday' },
    { hour: '20:00', bookings: 71, day: 'Tuesday' },
    { hour: '21:00', bookings: 48, day: 'Tuesday' },
    { hour: '22:00', bookings: 31, day: 'Tuesday' },
    
    // Wednesday
    { hour: '06:00', bookings: 18, day: 'Wednesday' },
    { hour: '07:00', bookings: 25, day: 'Wednesday' },
    { hour: '08:00', bookings: 31, day: 'Wednesday' },
    { hour: '09:00', bookings: 38, day: 'Wednesday' },
    { hour: '10:00', bookings: 34, day: 'Wednesday' },
    { hour: '11:00', bookings: 28, day: 'Wednesday' },
    { hour: '12:00', bookings: 41, day: 'Wednesday' },
    { hour: '13:00', bookings: 48, day: 'Wednesday' },
    { hour: '14:00', bookings: 44, day: 'Wednesday' },
    { hour: '15:00', bookings: 51, day: 'Wednesday' },
    { hour: '16:00', bookings: 58, day: 'Wednesday' },
    { hour: '17:00', bookings: 64, day: 'Wednesday' },
    { hour: '18:00', bookings: 71, day: 'Wednesday' },
    { hour: '19:00', bookings: 78, day: 'Wednesday' },
    { hour: '20:00', bookings: 74, day: 'Wednesday' },
    { hour: '21:00', bookings: 51, day: 'Wednesday' },
    { hour: '22:00', bookings: 34, day: 'Wednesday' },
    
    // Continue for other days...
    // Thursday - Peak day
    { hour: '06:00', bookings: 22, day: 'Thursday' },
    { hour: '07:00', bookings: 29, day: 'Thursday' },
    { hour: '08:00', bookings: 35, day: 'Thursday' },
    { hour: '09:00', bookings: 42, day: 'Thursday' },
    { hour: '10:00', bookings: 38, day: 'Thursday' },
    { hour: '11:00', bookings: 32, day: 'Thursday' },
    { hour: '12:00', bookings: 45, day: 'Thursday' },
    { hour: '13:00', bookings: 52, day: 'Thursday' },
    { hour: '14:00', bookings: 48, day: 'Thursday' },
    { hour: '15:00', bookings: 55, day: 'Thursday' },
    { hour: '16:00', bookings: 62, day: 'Thursday' },
    { hour: '17:00', bookings: 68, day: 'Thursday' },
    { hour: '18:00', bookings: 75, day: 'Thursday' },
    { hour: '19:00', bookings: 82, day: 'Thursday' },
    { hour: '20:00', bookings: 78, day: 'Thursday' },
    { hour: '21:00', bookings: 55, day: 'Thursday' },
    { hour: '22:00', bookings: 38, day: 'Thursday' },
    
    // Friday - High activity
    { hour: '06:00', bookings: 25, day: 'Friday' },
    { hour: '07:00', bookings: 32, day: 'Friday' },
    { hour: '08:00', bookings: 38, day: 'Friday' },
    { hour: '09:00', bookings: 45, day: 'Friday' },
    { hour: '10:00', bookings: 41, day: 'Friday' },
    { hour: '11:00', bookings: 35, day: 'Friday' },
    { hour: '12:00', bookings: 48, day: 'Friday' },
    { hour: '13:00', bookings: 55, day: 'Friday' },
    { hour: '14:00', bookings: 51, day: 'Friday' },
    { hour: '15:00', bookings: 58, day: 'Friday' },
    { hour: '16:00', bookings: 65, day: 'Friday' },
    { hour: '17:00', bookings: 71, day: 'Friday' },
    { hour: '18:00', bookings: 78, day: 'Friday' },
    { hour: '19:00', bookings: 85, day: 'Friday' },
    { hour: '20:00', bookings: 81, day: 'Friday' },
    { hour: '21:00', bookings: 68, day: 'Friday' },
    { hour: '22:00', bookings: 52, day: 'Friday' },
    
    // Weekend data - Saturday
    { hour: '08:00', bookings: 45, day: 'Saturday' },
    { hour: '09:00', bookings: 52, day: 'Saturday' },
    { hour: '10:00', bookings: 58, day: 'Saturday' },
    { hour: '11:00', bookings: 65, day: 'Saturday' },
    { hour: '12:00', bookings: 72, day: 'Saturday' },
    { hour: '13:00', bookings: 78, day: 'Saturday' },
    { hour: '14:00', bookings: 85, day: 'Saturday' },
    { hour: '15:00', bookings: 91, day: 'Saturday' },
    { hour: '16:00', bookings: 88, day: 'Saturday' },
    { hour: '17:00', bookings: 82, day: 'Saturday' },
    { hour: '18:00', bookings: 75, day: 'Saturday' },
    { hour: '19:00', bookings: 68, day: 'Saturday' },
    { hour: '20:00', bookings: 61, day: 'Saturday' },
    { hour: '21:00', bookings: 54, day: 'Saturday' },
    
    // Sunday
    { hour: '08:00', bookings: 38, day: 'Sunday' },
    { hour: '09:00', bookings: 45, day: 'Sunday' },
    { hour: '10:00', bookings: 52, day: 'Sunday' },
    { hour: '11:00', bookings: 58, day: 'Sunday' },
    { hour: '12:00', bookings: 65, day: 'Sunday' },
    { hour: '13:00', bookings: 71, day: 'Sunday' },
    { hour: '14:00', bookings: 78, day: 'Sunday' },
    { hour: '15:00', bookings: 82, day: 'Sunday' },
    { hour: '16:00', bookings: 79, day: 'Sunday' },
    { hour: '17:00', bookings: 73, day: 'Sunday' },
    { hour: '18:00', bookings: 66, day: 'Sunday' },
    { hour: '19:00', bookings: 59, day: 'Sunday' },
    { hour: '20:00', bookings: 52, day: 'Sunday' },
    { hour: '21:00', bookings: 45, day: 'Sunday' },
  ],
  total: 4238,
  period: 'weekly',
  lastUpdated: '2025-02-10T18:30:00Z'
};

// Sports theme colors
export const CHART_COLORS = {
  primary: '#2563eb',      // Blue
  secondary: '#059669',    // Green
  accent: '#dc2626',       // Red
  warning: '#ea580c',      // Orange
  success: '#16a34a',      // Green
  info: '#0891b2',         // Cyan
  purple: '#7c3aed',       // Purple
  yellow: '#eab308',       // Yellow
  gradient: {
    blue: ['#3b82f6', '#1d4ed8'],
    green: ['#10b981', '#059669'],
    orange: ['#f59e0b', '#d97706'],
    purple: ['#8b5cf6', '#7c3aed'],
  }
};
