'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function VenueTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [venues, setVenues] = useState<any[]>([]);

  const seedVenues = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/venues/seed', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed venues');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkVenues = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/venues/seed');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check venues');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/venues?view=card&limit=100');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch venues');
      }
      
      setVenues(data.venues || []);
      setResult({
        success: true,
        message: `Fetched ${data.venues?.length || 0} venues`,
        data: data
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Venue Database Testing</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button 
            onClick={checkVenues} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Checking...' : 'Check Venues'}
          </Button>
          
          <Button 
            onClick={seedVenues} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Seeding...' : 'Seed Test Venues'}
          </Button>
          
          <Button 
            onClick={fetchVenues} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Fetching...' : 'Fetch Venues'}
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              Error: {error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Result
                {result.success && <Badge className="bg-green-100 text-green-800">Success</Badge>}
                {!result.success && <Badge className="bg-red-100 text-red-800">Failed</Badge>}
              </CardTitle>
              <CardDescription>
                {result.message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {venues.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Fetched Venues ({venues.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map((venue, index) => (
                <Card key={venue.id || index} className="h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{venue.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {venue.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {venue.sports?.map((sport: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {sport}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-green-600">
                          ₹{venue.price}/hour
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm">{venue.rating} ({venue.reviews})</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {venue.amenities?.slice(0, 3).join(', ')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
