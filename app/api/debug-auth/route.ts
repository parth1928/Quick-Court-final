import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  console.log('🔍 Auth debug endpoint called');
  
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('📋 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'No Bearer token found',
        authHeader: authHeader ? 'Present but invalid format' : 'Missing'
      }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    console.log('🎫 Token received:', token ? `${token.substring(0, 20)}...` : 'Empty');
    console.log('🔑 JWT_SECRET being used:', JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'Missing');
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ Token decoded successfully:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });
    
    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      },
      tokenInfo: {
        exp: decoded.exp,
        iat: decoded.iat
      }
    });
    
  } catch (error: any) {
    console.error('❌ Auth debug error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({
        error: 'Invalid token',
        details: error.message,
        jwtSecret: JWT_SECRET ? 'Set' : 'Missing'
      }, { status: 401 });
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({
        error: 'Token expired',
        details: error.message
      }, { status: 401 });
    }
    
    return NextResponse.json({
      error: 'Authentication failed',
      details: error.message
    }, { status: 401 });
  }
}
