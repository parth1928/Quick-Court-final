"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { fetchEarningsData } from '@/lib/fetchChartData';
import { EarningsData, ChartFilters } from '@/lib/types/chartTypes';
import { CHART_COLORS } from '@/lib/mockData';
import './chart-colors.css';
import { getColorClass } from './chart-utils';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

interface EarningsSummaryChartProps {
  height?: number;
  showControls?: boolean;
  initialChartType?: 'doughnut' | 'bar';
}

type ChartType = 'doughnut' | 'bar';

const EarningsSummaryChart: React.FC<EarningsSummaryChartProps> = ({
  height = 300,
  showControls = true,
  initialChartType = 'doughnut'
}) => {
  const [data, setData] = useState<EarningsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const loadData = async (filters?: ChartFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchEarningsData(filters);
      setData(response.data);
      setTotalEarnings(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Prepare data for Chart.js Doughnut
  const doughnutData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.amount),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 2,
        hoverBackgroundColor: data.map(item => item.color + '80'),
        hoverBorderColor: data.map(item => item.color),
        hoverBorderWidth: 3,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create our own legend
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / totalEarnings) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 2,
      }
    },
    interaction: {
      intersect: false,
    },
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <div className="space-y-1">
            <p className="text-blue-600">
              <span 
                className={`inline-block w-3 h-3 rounded-full mr-2 ${getColorClass((data as any)?.color || '#2563eb')}`}
              ></span>
              Amount: ${payload[0]?.value?.toLocaleString()}
            </p>
            <p className="text-gray-600">
              Percentage: {data.percentage.toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
            <DollarSign className="h-5 w-5" />
            Earnings Summary - Error
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

  const topEarner = data.length > 0 ? data[0] : null;
  const avgEarnings = data.length > 0 ? totalEarnings / data.length : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Earnings Summary
            </CardTitle>
            <CardDescription>
              Revenue breakdown by facility category
            </CardDescription>
          </div>
          {showControls && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={chartType === 'doughnut' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('doughnut')}
                className={`flex items-center gap-2 ${chartType === 'doughnut' ? 'bg-white shadow-sm' : ''}`}
              >
                <PieChart className="h-4 w-4" />
                Doughnut
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
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Total Revenue</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-green-900">${totalEarnings.toLocaleString()}</span>
              <Badge className="bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </Badge>
            </div>
          </div>
          
          {topEarner && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div 
                  className={`w-4 h-4 rounded-full ${getColorClass(topEarner.color)}`}
                ></div>
                <span className="text-sm text-blue-700">Top Category</span>
              </div>
              <div className="mt-1">
                <span className="text-lg font-bold text-blue-900">{topEarner.category}</span>
                <p className="text-sm text-blue-700">${topEarner.amount.toLocaleString()} ({topEarner.percentage.toFixed(1)}%)</p>
              </div>
            </div>
          )}
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">Avg per Category</span>
            </div>
            <div className="mt-1">
              <span className="text-xl font-bold text-purple-900">${Math.round(avgEarnings).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {chartType === 'doughnut' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Doughnut Chart */}
            <div className="relative chart-height-350">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">${(totalEarnings / 1000).toFixed(1)}k</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">Category Breakdown</h4>
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${getColorClass(item.color)}`}
                    ></div>
                    <div>
                      <div className="font-medium text-gray-900">{item.category}</div>
                      <div className="text-sm text-gray-600">{item.percentage.toFixed(1)}% of total</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${item.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                stroke="#666"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip content={<CustomBarTooltip />} />
              
              <Bar
                dataKey="amount"
                radius={[4, 4, 0, 0]}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default EarningsSummaryChart;
