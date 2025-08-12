import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

// Define the schema directly to avoid model conflicts
const facilitySchema = new mongoose.Schema({
  name: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String,
  sports: [String],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'Active', 'Inactive', 'Maintenance'],
    default: 'pending'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String,
  description: String,
  rating: Number,
  totalBookings: Number,
  monthlyRevenue: Number,
  image: String,
  amenities: [String],
  fullAddress: String
}, { 
  timestamps: true,
  strict: false 
});

// Use a direct model to avoid caching issues
const Facility = mongoose.models.FacilityList || mongoose.model('FacilityList', facilitySchema, 'facilities');

// Get all pending facilities for approval
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const facilities = await Facility.find({ 
      approvalStatus: status 
    })
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      facilities
    });

  } catch (error: any) {
    console.error('Error fetching facilities for approval:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facilities' },
      { status: 500 }
    );
  }
}
