import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import AdminProfile from '@/models/AdminProfile';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Build filter for users
    let userFilter: any = { role: 'admin' };
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build filter for admin profiles
    let profileFilter: any = {};
    if (department) {
      profileFilter.department = department;
    }
    
    // Get admin users with their profiles
    const pipeline = [
      { $match: userFilter },
      {
        $lookup: {
          from: 'adminprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'adminProfile'
        }
      },
      { $unwind: { path: '$adminProfile', preserveNullAndEmptyArrays: true } },
      ...(department ? [{ $match: { 'adminProfile.department': department } }] : []),
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          password: 0,
          passwordHash: 0
        }
      }
    ];
    
    const admins = await User.aggregate(pipeline);
    
    // Get total count
    const totalPipeline = [
      { $match: userFilter },
      {
        $lookup: {
          from: 'adminprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'adminProfile'
        }
      },
      { $unwind: { path: '$adminProfile', preserveNullAndEmptyArrays: true } },
      ...(department ? [{ $match: { 'adminProfile.department': department } }] : []),
      { $count: 'total' }
    ];
    
    const totalResult = await User.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        admins,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching admin list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
