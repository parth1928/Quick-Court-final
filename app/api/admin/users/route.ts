import { NextRequest, NextResponse } from 'next/server';
import { createAdminUser, CreateAdminData } from '@/lib/admin-utils';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

// Define user schema for listing users
interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  createdAt: Date;
  updatedAt?: Date;
  lastActiveAt?: Date;
}

interface UserLeanDocument {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastActiveAt?: Date;
}

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  status: String,
  phone: String,
  createdAt: Date,
  updatedAt: Date,
  lastActiveAt: Date
}, { strict: false });

const User = mongoose.models.AdminUsersList || mongoose.model('AdminUsersList', userSchema, 'users');

// Route handlers
export const GET = handleUserGet;
export const POST = handleUserPost;

// Handle both listing users and getting single user details
async function handleUserGet(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If userId is provided, return single user details
    if (userId) {
      const { getAdminWithProfile } = await import('@/lib/admin-utils');
      const result = await getAdminWithProfile(userId);

      if (!result) {
        return NextResponse.json(
          { error: 'Admin user not found' },
          { status: 404 }
        );
      }

      // Remove password from response
      const { password: _, passwordHash: __, ...userWithoutPassword } = result.user;

      return NextResponse.json({
        success: true,
        data: {
          user: userWithoutPassword,
          adminProfile: result.adminProfile
        }
      });
    }

    // Handle list users with pagination and filtering
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Get users with pagination
    const users = await User.find(query)
      .select('name email role status phone createdAt updatedAt lastActiveAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as unknown as UserLeanDocument[];
    
    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    // Transform users for frontend
    const transformedUsers = users.map((user: any) => ({
      id: user._id.toString(),
      name: user.name || 'N/A',
      email: user.email || 'N/A',
      role: user.role === 'owner' ? 'Facility Owner' : 
            user.role === 'admin' ? 'Admin' : 'User',
      status: user.status || 'Active',
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      lastActive: user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 
                  user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A',
      phone: user.phone || 'N/A'
    }));
    
    return NextResponse.json({
      success: true,
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Error in user operation:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

async function handleUserPost(request: NextRequest) {
  try {
    // Ensure database connection
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const { name, email, password, phone } = body;
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Name, email, password, and phone are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const adminData: CreateAdminData = {
      name,
      email: email.toLowerCase(),
      password,
      phone,
      department: body.department,
      permissions: body.permissions,
      canManageUsers: body.canManageUsers,
      canManageFacilities: body.canManageFacilities,
      canManageTournaments: body.canManageTournaments,
      canViewReports: body.canViewReports,
      canManageBookings: body.canManageBookings,
      managedFacilities: body.managedFacilities,
      notes: body.notes
    };

    const result = await createAdminUser(adminData);
    
    // Remove password from response
    const { password: _, passwordHash: __, ...userWithoutPassword } = result.user;
    
    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        adminProfile: result.adminProfile
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating admin user:', error);
    
    if (error.message === 'User with this email already exists') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


