import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Define allowed roles as a const
export const ROLES = {
  USER: 'user',
  OWNER: 'owner',
  ADMIN: 'admin',
} as const;

// Define the JWT payload type
interface JWTPayload {
  userId: string;
  role: typeof ROLES[keyof typeof ROLES];
  email: string;
  iat?: number;
  exp?: number;
}

export async function validateToken(request: Request) {
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
    if (!token) return null;

    // Additional validation for token format
    if (!token.includes('.') || token.split('.').length !== 3) {
      console.error('Token validation error: Invalid JWT format');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET!) as unknown;
    
    // Validate the decoded token has the required fields
    const isValidPayload = (payload: any): payload is JWTPayload => {
      return (
        typeof payload === 'object' &&
        typeof payload.userId === 'string' &&
        typeof payload.email === 'string' &&
        Object.values(ROLES).includes(payload.role as any)
      );
    };

    if (!isValidPayload(decoded)) {
      throw new Error('Invalid token payload');
    }

    return decoded;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export function withAuth(handler: Function, allowedRoles?: string[]) {
  return async (request: Request) => {
    try {
      // Log incoming request details for debugging
      console.log('Auth request headers:', {
        auth: request.headers.get('Authorization'),
        cookie: request.headers.get('cookie')
      });

      // Validate token
      const user = await validateToken(request);

      if (!user) {
        console.log('Token validation failed');
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

      console.log('Token validated for user:', { id: user.userId, role: user.role });

      // Check roles if specified
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          console.log('Role check failed:', { required: allowedRoles, actual: user.role });
          return NextResponse.json(
            { error: `Forbidden - Required role: ${allowedRoles.join(' or ')}` },
            { status: 403 }
          );
        }
      }

      // Add user to request for handler
      const response = await handler(request, user);
      
      // Ensure response is a NextResponse
      const nextResponse = response instanceof NextResponse 
        ? response 
        : NextResponse.json(response);

      // Add CORS headers if needed
      const headers = new Headers(nextResponse.headers);
      headers.set('Access-Control-Allow-Credentials', 'true');
      
      // Return response with headers
      return new NextResponse(nextResponse.body, {
        status: nextResponse.status,
        statusText: nextResponse.statusText,
        headers
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
