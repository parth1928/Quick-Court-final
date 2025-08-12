import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import AdminProfile from '@/models/AdminProfile';

export async function checkAdminPermission(
  request: NextRequest,
  requiredPermission?: string
) {
  try {
    // Get user ID from session/token (you'll need to implement this based on your auth system)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { authorized: false, message: 'No authorization header' };
    }

    // Extract user ID from token (implement based on your auth system)
    // This is a placeholder - replace with your actual auth implementation
    const userId = extractUserIdFromToken(authHeader);
    
    if (!userId) {
      return { authorized: false, message: 'Invalid token' };
    }

    await connectDB();

    // Check if user exists and is admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return { authorized: false, message: 'User is not an admin' };
    }

    // If no specific permission required, just admin role is enough
    if (!requiredPermission) {
      return { authorized: true, user };
    }

    // Check specific permission
    const adminProfile = await AdminProfile.findOne({ userId });
    if (!adminProfile) {
      return { authorized: false, message: 'Admin profile not found' };
    }

    // Check permission based on the required permission
    let hasPermission = false;
    switch (requiredPermission) {
      case 'user_management':
        hasPermission = adminProfile.canManageUsers;
        break;
      case 'facility_management':
        hasPermission = adminProfile.canManageFacilities;
        break;
      case 'tournament_management':
        hasPermission = adminProfile.canManageTournaments;
        break;
      case 'booking_management':
        hasPermission = adminProfile.canManageBookings;
        break;
      case 'report_viewing':
        hasPermission = adminProfile.canViewReports;
        break;
      default:
        hasPermission = adminProfile.permissions.includes(requiredPermission);
    }

    if (!hasPermission) {
      return { authorized: false, message: 'Insufficient permissions' };
    }

    return { authorized: true, user, adminProfile };

  } catch (error) {
    console.error('Admin permission check error:', error);
    return { authorized: false, message: 'Internal server error' };
  }
}

// Placeholder function - implement based on your auth system
function extractUserIdFromToken(authHeader: string): string | null {
  // This should decode your JWT token and extract the user ID
  // Example implementation:
  // const token = authHeader.replace('Bearer ', '');
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // return decoded.userId;
  
  // For now, return null - you'll need to implement this
  return null;
}

export function withAdminAuth(handler: Function, requiredPermission?: string) {
  return async (request: NextRequest, context?: any) => {
    const authCheck = await checkAdminPermission(request, requiredPermission);
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.message },
        { status: 403 }
      );
    }

    // Add user and adminProfile to request context
    (request as any).user = authCheck.user;
    (request as any).adminProfile = authCheck.adminProfile;

    return handler(request, context);
  };
}
