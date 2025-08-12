import { NextRequest, NextResponse } from 'next/server';
import { withAuth, ROLES } from '@/lib/auth';

// Simple test endpoint to verify admin authentication
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    console.log('🧪 Admin test endpoint called by:', user);
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test endpoint failed', details: error.message },
      { status: 500 }
    );
  }
}, [ROLES.ADMIN]);
