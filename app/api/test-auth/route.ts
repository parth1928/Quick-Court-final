import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';

// Simple test endpoint to verify withAuth is working
export const GET = withAuth(async (request: Request, user: any) => {
  console.log('🧪 Test API called by user:', user.userId, 'role:', user.role);
  
  return NextResponse.json({
    success: true,
    message: 'Test API working correctly',
    user: {
      id: user.userId,
      email: user.email,
      role: user.role
    },
    timestamp: new Date().toISOString()
  });
}, ['user', 'owner', 'admin']);

export const POST = withAuth(async (request: Request, user: any) => {
  console.log('🧪 Test POST API called by user:', user.userId, 'role:', user.role);
  
  try {
    const body = await request.json();
    console.log('📝 Test POST body:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Test POST API working correctly',
      user: {
        id: user.userId,
        email: user.email,
        role: user.role
      },
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test POST error:', error);
    return NextResponse.json(
      { 
        error: 'Test POST error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}, ['user', 'owner', 'admin']);
