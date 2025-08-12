import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

// Define the schema directly in the API to avoid model conflicts
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
const Facility = mongoose.models.FacilityApproval || mongoose.model('FacilityApproval', facilitySchema, 'facilities');

// Approve or reject a facility
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { action, reason, adminId } = body;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const updateData: any = {
      approvalStatus: action === 'approve' ? 'approved' : 'rejected',
      approvedBy: adminId,
      approvedAt: new Date(),
      updatedAt: new Date()
    };

    if (action === 'approve') {
      updateData.status = 'Active';
    } else {
      updateData.rejectionReason = reason;
      updateData.status = 'Inactive';
    }

    // Use updateOne instead of findByIdAndUpdate to ensure the update works
    const updateResult = await Facility.updateOne(
      { _id: id },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Get the updated facility
    const facility = await Facility.findById(id).populate('owner', 'name email phone');

    return NextResponse.json({
      success: true,
      message: `Facility ${action}d successfully`,
      facility
    });

  } catch (error: any) {
    console.error('Error updating facility approval:', error);
    return NextResponse.json(
      { error: 'Failed to update facility' },
      { status: 500 }
    );
  }
}
