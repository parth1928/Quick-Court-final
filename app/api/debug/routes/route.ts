import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { withAuth } from '@/lib/auth';

// GET /api/debug/routes - Debug endpoint to check routing and connectivity
export async function GET() {
  try {
    console.log('🔍 Debug routes endpoint called');
    
    // Test database connection
    let dbStatus = 'disconnected';
    try {
      await dbConnect();
      dbStatus = 'connected';
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      dbStatus = 'error: ' + (dbError as Error).message;
    }
    
    // Get environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI ? 'configured' : 'missing',
      jwtSecret: process.env.JWT_SECRET ? 'configured' : 'missing'
    };
    
    // List of expected API routes
    const expectedRoutes = [
      '/api/auth/login',
      '/api/auth/signup', 
      '/api/users/me',
      '/api/users/me/bookings',
      '/api/admin/create-test-data',
      '/api/debug/routes'
    ];
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      server: {
        status: 'running',
        database: dbStatus,
        environment: envInfo
      },
      routes: {
        current: '/api/debug/routes',
        expected: expectedRoutes,
        note: 'All routes should be accessible from the Next.js app router'
      },
      debug: {
        message: 'If you can see this response, the API server is working correctly',
        nextSteps: [
          '1. Check if authentication is working by testing /api/users/me',
          '2. Verify JWT token format and expiration',
          '3. Test database connectivity and models',
          '4. Check browser console for client-side errors'
        ]
      }
    };
    
    console.log('✅ Debug routes response:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 Debug routes error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}

// Also create a protected version to test auth
export const POST = withAuth(async (request: Request, user: any) => {
  try {
    console.log('🔐 Protected debug endpoint called for user:', user.userId);
    
    return NextResponse.json({
      success: true,
      message: 'Authentication is working correctly!',
      user: {
        id: user.userId,
        email: user.email,
        role: user.role
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Protected debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Protected debug failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}, []);
