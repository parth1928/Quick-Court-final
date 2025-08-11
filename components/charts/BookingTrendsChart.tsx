"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { CalendarDays, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { fetchBookingTrends } from '@/lib/fetchChartData';
import { BookingTrendData, ChartFilters } from '@/lib/types/chartTypes';
import { CHART_COLORS } from '@/lib/mockData';

interface BookingTrendsChartProps {
  height?: number;
  showControls?: boolean;
  initialPeriod?: 'daily' | 'weekly' | 'monthly';
}

type ChartType = 'line' | 'bar';

const BookingTrendsChart: React.FC<BookingTrendsChartProps> = ({
  height = 300,
  showControls = true,
  initialPeriod = 'daily'
}) => {
  const [data, setData] = useState<BookingTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>(initialPeriod);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const loadData = async (filters: ChartFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchBookingTrends(filters);
      setData(response.data);
      setTotalBookings(response.total || 0);
      
      // Calculate total revenue from data
      const revenue = response.data.reduce((sum, item) => sum + item.revenue, 0);
      setTotalRevenue(revenue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData({ period });
  }, [period]);

  const handlePeriodChange = (newPeriod: 'daily' | 'weekly' | 'monthly') => {
    setPeriod(newPeriod);
  };

  const formatXAxisLabel = (value: string) => {
    if (period === 'daily') {
      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return value;
  };

  const formatTooltipLabel = (value: string) => {
    if (period === 'daily') {
      return new Date(value).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    return value;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{formatTooltipLabel(label)}</p>
          <div className="space-y-1">
            <p className="text-blue-600">
              <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
              Bookings: {payload[0]?.value}
            </p>
            <p className="text-green-600">
              <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-2"></span>
              Revenue: ${payload[1]?.value?.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate trend indicators
  const calculateTrend = () => {
    if (data.length < 2) return { bookingsTrend: 0, revenueTrend: 0 };
    
    const recent = data.slice(-7); // Last 7 data points
    const previous = data.slice(-14, -7); // Previous 7 data points
    
    if (previous.length === 0) return { bookingsTrend: 0, revenueTrend: 0 };
    
    const recentAvgBookings = recent.reduce((sum, item) => sum + item.bookings, 0) / recent.length;
    const previousAvgBookings = previous.reduce((sum, item) => sum + item.bookings, 0) / previous.length;
    
    const recentAvgRevenue = recent.reduce((sum, item) => sum + item.revenue, 0) / recent.length;
    const previousAvgRevenue = previous.reduce((sum, item) => sum + item.revenue, 0) / previous.length;
    
    const bookingsTrend = ((recentAvgBookings - previousAvgBookings) / previousAvgBookings) * 100;
    const revenueTrend = ((recentAvgRevenue - previousAvgRevenue) / previousAvgRevenue) * 100;
    
    return { bookingsTrend, revenueTrend };
  };

  const { bookingsTrend, revenueTrend } = calculateTrend();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Booking Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <CalendarDays className="h-5 w-5" />
            Booking Trends - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={() => loadData({ period })}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Booking Trends
            </CardTitle>
            <CardDescription>
              Track {period} booking patterns and revenue growth
            </CardDescription>
          </div>
          {showControls && (
            <div className="flex gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handlePeriodChange(p)}
                    className={`capitalize ${period === p ? 'bg-white shadow-sm' : ''}`}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={chartType === 'line' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className={chartType === 'line' ? 'bg-white shadow-sm' : ''}
                >
                  Line
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className={chartType === 'bar' ? 'bg-white shadow-sm' : ''}
                >
                  Bar
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">Total Bookings</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-blue-900">{totalBookings.toLocaleString()}</span>
              {bookingsTrend !== 0 && (
                <Badge variant={bookingsTrend > 0 ? 'default' : 'destructive'} className="text-xs">
                  {bookingsTrend > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(bookingsTrend).toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Total Revenue</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-green-900">${totalRevenue.toLocaleString()}</span>
              {revenueTrend !== 0 && (
                <Badge variant={revenueTrend > 0 ? 'default' : 'destructive'} className="text-xs">
                  {revenueTrend > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(revenueTrend).toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Avg per {period.slice(0, -2)}</span>
            </div>
            <div className="mt-1">
              <span className="text-xl font-bold text-purple-900">
                {data.length > 0 ? Math.round(totalBookings / data.length) : 0}
              </span>
            </div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-700">Avg Revenue</span>
            </div>
            <div className="mt-1">
              <span className="text-xl font-bold text-orange-900">
                ${data.length > 0 ? Math.round(totalRevenue / data.length).toLocaleString() : 0}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisLabel}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                yAxisId="bookings"
                orientation="left"
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                yAxisId="revenue"
                orientation="right"
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Line
                yAxisId="bookings"
                type="monotone"
                dataKey="bookings"
                stroke={CHART_COLORS.primary}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: CHART_COLORS.primary }}
              />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke={CHART_COLORS.secondary}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: CHART_COLORS.secondary }}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisLabel}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                yAxisId="bookings"
                orientation="left"
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                yAxisId="revenue"
                orientation="right"
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar
                yAxisId="bookings"
                dataKey="bookings"
                fill={CHART_COLORS.primary}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                yAxisId="revenue"
                dataKey="revenue"
                fill={CHART_COLORS.secondary}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BookingTrendsChart;
