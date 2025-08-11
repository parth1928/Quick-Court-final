import { 
  ChartEndpoint, 
  ChartDataResponse, 
  BookingTrendData, 
  EarningsData, 
  PeakHoursData,
  ChartFilters 
} from '@/lib/types/chartTypes';
import { 
  mockBookingTrends, 
  mockWeeklyBookingTrends,
  mockEarningsData, 
  mockPeakHoursData 
} from '@/lib/mockData';

/**
 * Simulates network delay for realistic behavior
 */
const simulateNetworkDelay = (min = 300, max = 800): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Mock data fetcher - will be replaced with real API calls
 * Structure allows for easy transition to real backend
 */
const fetchMockData = async <T>(
  endpoint: ChartEndpoint, 
  filters?: ChartFilters
): Promise<ChartDataResponse<T>> => {
  // Simulate network delay
  await simulateNetworkDelay();
  
  switch (endpoint) {
    case 'bookings':
      // Return different data based on period filter
      if (filters?.period === 'weekly') {
        return mockWeeklyBookingTrends as ChartDataResponse<T>;
      }
      return mockBookingTrends as ChartDataResponse<T>;
      
    case 'earnings':
      return mockEarningsData as ChartDataResponse<T>;
      
    case 'peak-hours':
      return mockPeakHoursData as ChartDataResponse<T>;
      
    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
};

/**
 * Real API fetcher - to be implemented when backend is ready
 * This function will replace fetchMockData
 */
const fetchRealData = async <T>(
  endpoint: ChartEndpoint, 
  filters?: ChartFilters
): Promise<ChartDataResponse<T>> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  
  // Build query parameters
  const params = new URLSearchParams();
  if (filters?.period) params.set('period', filters.period);
  if (filters?.dateRange?.start) params.set('startDate', filters.dateRange.start);
  if (filters?.dateRange?.end) params.set('endDate', filters.dateRange.end);
  if (filters?.venueId) params.set('venueId', filters.venueId);
  
  const queryString = params.toString();
  const url = `${baseUrl}/${endpoint}/data${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers when needed
        // 'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    throw new Error(`Failed to fetch ${endpoint} data`);
  }
};

/**
 * Main chart data fetcher
 * Switch between mock and real data by changing USE_MOCK_DATA
 */
const USE_MOCK_DATA = true; // Set to false when backend is ready

export const fetchChartData = async <T>(
  endpoint: ChartEndpoint, 
  filters?: ChartFilters
): Promise<ChartDataResponse<T>> => {
  if (USE_MOCK_DATA) {
    return fetchMockData<T>(endpoint, filters);
  } else {
    return fetchRealData<T>(endpoint, filters);
  }
};

/**
 * Specific typed fetch functions for better type safety
 */
export const fetchBookingTrends = (filters?: ChartFilters) => 
  fetchChartData<BookingTrendData>('bookings', filters);

export const fetchEarningsData = (filters?: ChartFilters) => 
  fetchChartData<EarningsData>('earnings', filters);

export const fetchPeakHoursData = (filters?: ChartFilters) => 
  fetchChartData<PeakHoursData>('peak-hours', filters);

/**
 * Error handling wrapper for chart data fetching
 */
export const fetchChartDataSafe = async <T>(
  endpoint: ChartEndpoint, 
  filters?: ChartFilters
): Promise<{ data: ChartDataResponse<T> | null; error: string | null }> => {
  try {
    const data = await fetchChartData<T>(endpoint, filters);
    return { data, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Error fetching chart data for ${endpoint}:`, errorMessage);
    return { data: null, error: errorMessage };
  }
};

export default fetchChartData;
