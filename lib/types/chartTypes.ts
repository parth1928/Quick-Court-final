export interface BookingTrendData {
  date: string;
  bookings: number;
  revenue: number;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface EarningsData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface PeakHoursData {
  hour: string;
  bookings: number;
  day: string;
}

export interface ChartDataResponse<T> {
  data: T[];
  total?: number;
  period?: string;
  lastUpdated: string;
}

export type ChartEndpoint = 'bookings' | 'earnings' | 'peak-hours';

export interface ChartFilters {
  period?: 'daily' | 'weekly' | 'monthly';
  dateRange?: {
    start: string;
    end: string;
  };
  venueId?: string;
}
