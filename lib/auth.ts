import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

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
      // Validate token
      const user = await validateToken(request);

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid or missing token' },
          { status: 401 }
        );
      }

      // Check roles if specified
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          return NextResponse.json(
            { error: `Forbidden - Required role: ${allowedRoles.join(' or ')}` },
            { status: 403 }
          );
        }
      }

      // Add authorization header to response for client to use in subsequent requests
      const response = await handler(request, user);
      
      // Ensure response is a NextResponse
      const nextResponse = response instanceof NextResponse 
        ? response 
        : NextResponse.json(response);

      // Clone response to add headers
  return nextResponse;
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
