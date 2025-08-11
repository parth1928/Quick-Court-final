"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Clock, TrendingUp, Calendar, Users } from 'lucide-react';
import { fetchPeakHoursData } from '@/lib/fetchChartData';
import { PeakHoursData, ChartFilters } from '@/lib/types/chartTypes';
import { CHART_COLORS } from '@/lib/mockData';

interface PeakBookingHoursChartProps {
  height?: number;
  showControls?: boolean;
  selectedDay?: string;
}

const PeakBookingHoursChart: React.FC<PeakBookingHoursChartProps> = ({
  height = 300,
  showControls = true,
  selectedDay = 'All'
}) => {
  const [data, setData] = useState<PeakHoursData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>(selectedDay);
  const [totalBookings, setTotalBookings] = useState(0);

  const daysOfWeek = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const loadData = async (filters?: ChartFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchPeakHoursData(filters);
      setData(response.data);
      setTotalBookings(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter data by selected day
  const filteredData = React.useMemo(() => {
    if (activeDay === 'All') {
      // Aggregate all days by hour
      const hourlyTotals = data.reduce((acc, item) => {
        const existing = acc.find(a => a.hour === item.hour);
        if (existing) {
          existing.bookings += item.bookings;
        } else {
          acc.push({ hour: item.hour, bookings: item.bookings, day: 'All' });
        }
        return acc;
      }, [] as PeakHoursData[]);
      
      return hourlyTotals.sort((a, b) => a.hour.localeCompare(b.hour));
    } else {
      return data
        .filter(item => item.day === activeDay)
        .sort((a, b) => a.hour.localeCompare(b.hour));
    }
  }, [data, activeDay]);

  const handleDayChange = (day: string) => {
    setActiveDay(day);
  };

  const formatHour = (hour: string) => {
    const [hourNum] = hour.split(':');
    const hourInt = parseInt(hourNum);
    if (hourInt === 0) return '12 AM';
    if (hourInt === 12) return '12 PM';
    if (hourInt < 12) return `${hourInt} AM`;
    return `${hourInt - 12} PM`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{formatHour(label)}</p>
          <div className="space-y-1">
            <p className="text-blue-600">
              <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
              Bookings: {payload[0]?.value}
            </p>
            {activeDay !== 'All' && (
              <p className="text-gray-600 text-sm">{activeDay}</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate peak insights
  const peakHour = filteredData.length > 0 
    ? filteredData.reduce((max, item) => item.bookings > max.bookings ? item : max, filteredData[0])
    : null;

  const avgBookingsPerHour = filteredData.length > 0 
    ? Math.round(filteredData.reduce((sum, item) => sum + item.bookings, 0) / filteredData.length)
    : 0;

  const peakPeriod = React.useMemo(() => {
    if (filteredData.length === 0) return null;
    
    // Find 3-hour window with highest total bookings
    let maxTotal = 0;
    let bestPeriod = '';
    
    for (let i = 0; i <= filteredData.length - 3; i++) {
      const windowTotal = filteredData.slice(i, i + 3).reduce((sum, item) => sum + item.bookings, 0);
      if (windowTotal > maxTotal) {
        maxTotal = windowTotal;
        bestPeriod = `${formatHour(filteredData[i].hour)} - ${formatHour(filteredData[i + 2].hour)}`;
      }
    }
    
    return { period: bestPeriod, total: maxTotal };
  }, [filteredData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Peak Booking Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
            <Clock className="h-5 w-5" />
            Peak Booking Hours - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={() => loadData()}
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
              <Clock className="h-5 w-5 text-purple-600" />
              Peak Booking Hours
            </CardTitle>
            <CardDescription>
              Hourly booking patterns {activeDay !== 'All' ? `for ${activeDay}` : 'across all days'}
            </CardDescription>
          </div>
        </div>
        
        {/* Day Selection */}
        {showControls && (
          <div className="flex flex-wrap gap-1 mt-4">
            {daysOfWeek.map((day) => (
              <Button
                key={day}
                variant={activeDay === day ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDayChange(day)}
                className={`text-xs ${activeDay === day ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-50'}`}
              >
                {day}
              </Button>
            ))}
          </div>
        )}
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Peak Hour</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-purple-900">
                {peakHour ? formatHour(peakHour.hour) : 'N/A'}
              </span>
              {peakHour && (
                <p className="text-sm text-purple-700">{peakHour.bookings} bookings</p>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">Avg per Hour</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-blue-900">{avgBookingsPerHour}</span>
              <p className="text-sm text-blue-700">bookings</p>
            </div>
          </div>
          
          {peakPeriod && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-700">Peak Window</span>
              </div>
              <div className="mt-1">
                <span className="text-sm font-bold text-orange-900">{peakPeriod.period}</span>
                <p className="text-sm text-orange-700">{peakPeriod.total} total</p>
              </div>
            </div>
          )}
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Total Today</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-bold text-green-900">
                {filteredData.reduce((sum, item) => sum + item.bookings, 0)}
              </span>
              <p className="text-sm text-green-700">bookings</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="hour"
              tickFormatter={formatHour}
              tick={{ fontSize: 12 }}
              stroke="#666"
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line for average */}
            <ReferenceLine 
              y={avgBookingsPerHour} 
              stroke="#6b7280" 
              strokeDasharray="5 5"
              label={{ value: `Avg: ${avgBookingsPerHour}`, position: "top" }}
            />
            
            <Area
              type="monotone"
              dataKey="bookings"
              stroke={CHART_COLORS.purple}
              strokeWidth={3}
              fill="url(#bookingsGradient)"
              dot={{ fill: CHART_COLORS.purple, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: CHART_COLORS.purple, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Insights */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">📊 Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
            {peakHour && (
              <div>
                <span className="font-medium">Peak Activity:</span> {formatHour(peakHour.hour)} with {peakHour.bookings} bookings
              </div>
            )}
            {peakPeriod && (
              <div>
                <span className="font-medium">Best 3-Hour Window:</span> {peakPeriod.period}
              </div>
            )}
            <div>
              <span className="font-medium">Day Performance:</span> {
                activeDay === 'All' ? 'Showing aggregated data' : 
                filteredData.reduce((sum, item) => sum + item.bookings, 0) > avgBookingsPerHour * filteredData.length 
                  ? 'Above average day' : 'Below average day'
              }
            </div>
            <div>
              <span className="font-medium">Coverage:</span> {filteredData.length} hours tracked
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeakBookingHoursChart;
