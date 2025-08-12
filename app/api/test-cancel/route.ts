import { NextResponse } from 'next/server';

// Simple test endpoint to verify routing
export async function GET() {
  console.log('🧪 Test endpoint hit!');
  return NextResponse.json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  console.log('🧪 Test POST endpoint hit!');
  const body = await request.json();
  console.log('🧪 Test POST body:', body);
  
  return NextResponse.json({
    success: true,
    message: 'Test POST endpoint working',
    receivedData: body,
    timestamp: new Date().toISOString()
  });
}
