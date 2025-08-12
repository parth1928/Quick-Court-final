import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import AdminProfile from '@/models/AdminProfile';
import { updateAdminPermissions } from '@/lib/admin-utils';
import { withAuth, ROLES } from '@/lib/auth';

console.log('📁 User model imported:', !!User);

// PUT - Update user (ban/unban, role change, etc.)
export const PUT = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();
    
    // Extract user ID from URL
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1];
    
    console.log('🔧 Ban API called:', { id, segments, url: url.pathname });
    
    if (!id) {
      console.error('❌ No user ID provided');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const body = await request.json();
    const { action, newRole } = body;
    
    console.log('🎯 User action requested:', { id, action, newRole, adminUser: user.userId });
    
    // Handle different actions
    if (action === 'ban') {
      console.log('🚫 Attempting to ban user:', id);
      const result = await User.findByIdAndUpdate(id, { 
        status: 'banned',
        bannedAt: new Date(),
        updatedAt: new Date()
      }, { new: true });
      
      console.log('✅ User ban result:', result ? 'Success' : 'User not found');
      
      if (!result) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'User banned successfully'
      });
    }
    
    if (action === 'unban') {
      console.log('✅ Attempting to unban user:', id);
      const result = await User.findByIdAndUpdate(id, { 
        status: 'active',
        $unset: { bannedAt: 1 },
        updatedAt: new Date()
      }, { new: true });
      
      console.log('✅ User unban result:', result ? 'Success' : 'User not found');
      
      if (!result) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'User unbanned successfully'
      });
    }
    
    if (action === 'suspend') {
      await User.findByIdAndUpdate(id, { 
        status: 'suspended',
        suspendedAt: new Date(),
        updatedAt: new Date()
      });
      
      return NextResponse.json({
        success: true,
        message: 'User suspended successfully'
      });
    }
    
    if (action === 'changeRole' && newRole) {
      await User.findByIdAndUpdate(id, { 
        role: newRole,
        updatedAt: new Date()
      });
      
      return NextResponse.json({
        success: true,
        message: `User role changed to ${newRole} successfully`
      });
    }
    
    // General update for admin profiles
    if (body.department || body.permissions) {
      const updatedProfile = await AdminProfile.findOneAndUpdate(
        { userId: id },
        { 
          $set: {
            ...body,
            updatedAt: new Date()
          }
        },
        { new: true }
      ).populate('userId', 'name email phone role');
      
      if (!updatedProfile) {
        return NextResponse.json(
          { error: 'Admin profile not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Admin profile updated successfully',
        profile: updatedProfile
      });
    }
    
    const updatedUser = await User.findById(id);
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
    
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}, [ROLES.ADMIN]);

export const DELETE = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();
    
    // Extract user ID from URL
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1];
    
    // Delete admin profile
    const deletedProfile = await AdminProfile.findOneAndDelete({ userId: id });
    
    if (!deletedProfile) {
      return NextResponse.json(
        { error: 'Admin profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin profile deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting admin profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, [ROLES.ADMIN]);
