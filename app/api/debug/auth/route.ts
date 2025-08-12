import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

// GET /api/debug/auth - Debug auth information
export const GET = withAuth(async (request: Request, user: any) => {
  try {
    console.log('🔍 Auth Debug - Raw user object:', user);
    console.log('🔍 Auth Debug - User ID type:', typeof user.userId);
    console.log('🔍 Auth Debug - User ID value:', user.userId);
    
    await dbConnect();
    
    // Try to find the user in database
    const dbUser = await User.findById(user.userId);
    console.log('🔍 Auth Debug - Database user found:', !!dbUser);
    
    if (dbUser) {
      console.log('🔍 Auth Debug - Database user ID:', dbUser._id.toString());
      console.log('🔍 Auth Debug - Database user email:', dbUser.email);
    }
    
    // Check ObjectId pattern
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    const isValidObjectId = objectIdPattern.test(user.userId);
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          role: user.role,
          userIdType: typeof user.userId,
          isValidObjectId,
          userExists: !!dbUser,
          dbUserId: dbUser?._id.toString(),
          dbUserEmail: dbUser?.email
        }
      }
    });
    
  } catch (error: any) {
    console.error('💥 Auth debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Auth debug failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}, []);
