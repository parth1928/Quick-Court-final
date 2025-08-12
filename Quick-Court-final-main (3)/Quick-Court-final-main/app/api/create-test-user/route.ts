import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';

export async function POST() {
  try {
    await dbConnect();
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'testuser@example.com' });
    
    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Test user already exists',
        userId: existingUser._id
      });
    }
    
    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'hashedpassword123', // In real app, this would be properly hashed
      role: 'user',
      phone: '+1234567890'
    });
    
    const savedUser = await testUser.save();
    
    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      userId: savedUser._id
    });
    
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create test user'
    }, { status: 500 });
  }
}
