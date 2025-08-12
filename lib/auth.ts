import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Define allowed roles as a const
export const ROLES = {
  USER: 'user',
  OWNER: 'owner',
  ADMIN: 'admin',
} as const;

// Define the JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: typeof ROLES[keyof typeof ROLES];
}

// Define the auth context which includes the token
export interface AuthContext extends JWTPayload {
  token: string;
}

async function validateToken(request: NextRequest): Promise<AuthContext | null> {
  try {
    // Prefer Authorization header, fall back to cookie
    let token: string | undefined;
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    }
    if (!token) {
      // Cookie header parsing
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const match = cookieHeader.split(';').map(c=>c.trim()).find(c=>c.startsWith('authToken='));
        if (match) token = decodeURIComponent(match.split('=')[1]);
      }
    }
    if (!token) {
      console.log('No token found in request');
      return null;
    }

    // Additional validation for token format
    if (!token.includes('.') || token.split('.').length !== 3) {
      console.error('Token validation error: Invalid JWT format');
      return null;
    }

    console.log('Attempting to verify token:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, JWT_SECRET!) as unknown;
    
    // Validate the decoded token has the required fields
    const isValidPayload = (payload: any): payload is JWTPayload => {
      return (
        typeof payload === 'object' &&
        typeof payload.userId === 'string' &&
        typeof payload.email === 'string' &&
        typeof payload.role === 'string' &&
        Object.values(ROLES).includes(payload.role as typeof ROLES[keyof typeof ROLES])
      );
    };

    if (!isValidPayload(decoded)) {
      console.error('Invalid token payload structure:', {
        hasUserId: typeof (decoded as any)?.userId === 'string',
        hasEmail: typeof (decoded as any)?.email === 'string', 
        hasRole: typeof (decoded as any)?.role === 'string',
        actualPayload: decoded
      });
      throw new Error('Invalid token payload');
    }

    // Return the AuthContext with both payload and token
    return {
      ...decoded,
      token
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export type AuthenticatedHandler = (
  req: NextRequest,
  context: AuthContext
) => Promise<NextResponse>;

type Role = typeof ROLES[keyof typeof ROLES];

export function withAuth(handler: AuthenticatedHandler, allowedRoles?: Role[]) {
  return async (request: NextRequest) => {
    try {
      // Log incoming request details for debugging
      console.log('🔐 Auth request received:', {
        method: request.method,
        url: request.url,
        authHeader: request.headers.get('Authorization')?.substring(0, 30) + '...',
        userAgent: request.headers.get('user-agent')?.substring(0, 50) + '...'
      });

      // Validate token
      const user = await validateToken(request);

      if (!user) {
        console.log('❌ Token validation failed - no user returned');
        return NextResponse.json(
          { error: 'Unauthorized - Invalid or missing token' },
          { 
            status: 401,
            headers: {
              'WWW-Authenticate': 'Bearer error="invalid_token"'
            }
          }
        );
      }

      console.log('✅ Token validated for user:', { id: user.userId, role: user.role, email: user.email });

      // Optional role checking
      if (allowedRoles && allowedRoles.length && !allowedRoles.includes(user.role as Role)) {
        console.log('❌ Role check failed:', { userRole: user.role, allowedRoles });
        return NextResponse.json(
          { error: 'Forbidden - insufficient role' },
          { status: 403 }
        );
      }

      // Invoke handler
      console.log('🚀 Calling authenticated handler...');
      const response = await handler(request, user);
      
      // Ensure response is a NextResponse
      const nextResponse = response instanceof NextResponse 
        ? response 
        : NextResponse.json(response);

      // Add CORS headers if needed
      const headers = new Headers(nextResponse.headers);
      headers.set('Access-Control-Allow-Credentials', 'true');
      
      console.log('✅ Auth handler completed successfully');
      
      // Return response with headers
      return new NextResponse(nextResponse.body, {
        status: nextResponse.status,
        statusText: nextResponse.statusText,
        headers
      });
    } catch (error) {
      console.error('💥 Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
