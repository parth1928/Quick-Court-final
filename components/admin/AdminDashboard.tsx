import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminAPI, AdminStatsResponse } from '@/lib/api/admin';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Real API call for booking trends
const fetchBookingTrends = async (params: { period: string }) => {
  try {
    const response = await fetch(`/api/admin/charts/booking-trends?period=${params.period}`);
    if (!response.ok) throw new Error('Failed to fetch booking trends');
    return await response.json();
  } catch (error) {
    console.error('Error fetching booking trends:', error);
    return { success: false, data: { trends: [] } };
  }
};

// Real API call for venue bookings
const fetchVenueBookings = async () => {
  try {
    const response = await fetch('/api/admin/charts/venue-bookings');
    if (!response.ok) throw new Error('Failed to fetch venue bookings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching venue bookings:', error);
    return { success: false, data: { venues: [] } };
  }
};

export function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking chart state
  const [bookingTrends, setBookingTrends] = useState<any[]>([]);
  const [totalBookingsByVenue, setTotalBookingsByVenue] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdminStats();
      setStats(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch admin statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking trends and venue data for charts
  const fetchCharts = async () => {
    try {
      setChartLoading(true);
      
      // Fetch booking trends
      const trendResponse = await fetchBookingTrends({ period: 'monthly' });
      if (trendResponse.success && trendResponse.data?.trends) {
        setBookingTrends(trendResponse.data.trends);
      }
      
      // Fetch venue bookings
      const venueResponse = await fetchVenueBookings();
      if (venueResponse.success && venueResponse.data?.venues) {
        setTotalBookingsByVenue(venueResponse.data.venues);
      }
      
    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch chart data',
        variant: 'destructive',
      });
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  fetchCharts();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: IconComponent,
    variant = 'default' 
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ComponentType<any>;
    variant?: 'default' | 'success' | 'warning';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <IconComponent className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const DepartmentCard = ({ departments }: { departments: Record<string, number> }) => (
    <Card>
      <CardHeader>
        <CardTitle>Admin Distribution by Department</CardTitle>
        <CardDescription>Current admin users across departments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(departments).map(([department, count]) => (
          <div key={department} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {department.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            <span className="font-medium">{count}</span>
          </div>
        ))}
        {Object.keys(departments).length === 0 && (
          <p className="text-sm text-muted-foreground">No departments assigned yet</p>
        )}
      </CardContent>
    </Card>
  );

  const PermissionsCard = ({ permissions }: { permissions: any }) => (
    <Card>
      <CardHeader>
        <CardTitle>Permission Distribution</CardTitle>
        <CardDescription>Number of admins with each permission</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Manage Users</span>
          <Badge variant="secondary">{permissions.canManageUsers}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Manage Facilities</span>
          <Badge variant="secondary">{permissions.canManageFacilities}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Manage Tournaments</span>
          <Badge variant="secondary">{permissions.canManageTournaments}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">View Reports</span>
          <Badge variant="secondary">{permissions.canViewReports}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Manage Bookings</span>
          <Badge variant="secondary">{permissions.canManageBookings}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Loading admin statistics...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <Card className="animate-pulse"><CardContent className="p-6"><div className="h-48 bg-muted rounded"></div></CardContent></Card>
          <Card className="animate-pulse"><CardContent className="p-6"><div className="h-48 bg-muted rounded"></div></CardContent></Card>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Failed to load admin statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of admin users and permissions</p>
      </div>

      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Admins"
          value={stats.generalStats.totalAdmins}
          description="Active admin accounts"
          icon={Users}
        />
        <StatCard
          title="Active Admins"
          value={stats.generalStats.activeAdmins}
          description="Active in last 7 days"
          icon={Activity}
          variant="success"
        />
        <StatCard
          title="User Managers"
          value={stats.permissionStats.canManageUsers}
          description="Can manage users"
          icon={Shield}
        />
        <StatCard
          title="Report Viewers"
          value={stats.permissionStats.canViewReports}
          description="Can view reports"
          icon={BarChart3}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <DepartmentCard departments={stats.generalStats.departmentCounts} />
        <PermissionsCard permissions={stats.permissionStats} />
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Admin system status and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((stats.generalStats.activeAdmins / stats.generalStats.totalAdmins) * 100) || 0}%
              </div>
              <p className="text-sm text-muted-foreground">Admin Activity Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(stats.generalStats.departmentCounts).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Departments</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.permissionStats.canManageUsers + 
                 stats.permissionStats.canManageFacilities + 
                 stats.permissionStats.canManageTournaments}
              </div>
              <p className="text-sm text-muted-foreground">Total Permissions Granted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends (Last 30 Days)</CardTitle>
            <CardDescription>Track daily bookings over the last month</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            {chartLoading ? (
              <div className="h-48 bg-muted animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Bookings" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Bookings by Venue</CardTitle>
            <CardDescription>Distribution of bookings across venues</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            {chartLoading ? (
              <div className="h-48 bg-muted animate-pulse rounded" />
            ) : totalBookingsByVenue.length === 0 ? (
              <div className="text-muted-foreground">No booking data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={totalBookingsByVenue} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {totalBookingsByVenue.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={["#3B82F6","#EF4444","#10B981","#F59E0B","#8B5CF6","#06B6D4"][idx % 6]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
