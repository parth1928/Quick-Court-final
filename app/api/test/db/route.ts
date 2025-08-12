import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test the connection
    await connectDB();
    
    // Get connection info
    const connectionState = mongoose.connection.readyState;
    const dbName = mongoose.connection.db?.databaseName;
    
    const states = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    };

    const result = {
      success: true,
      status: states[connectionState as keyof typeof states] || 'unknown',
      database: dbName,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      timestamp: new Date().toISOString(),
      message: 'Database connection test successful'
    };

    console.log('✅ Database test result:', result);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      message: 'Database connection test failed'
    }, { status: 500 });
  }
}
