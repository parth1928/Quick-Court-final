import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminProfile extends Document {
  userId: mongoose.Types.ObjectId;
  permissions: string[];
  assignedTasks: string[];
  department: string;
  managedFacilities: mongoose.Types.ObjectId[];
  canManageUsers: boolean;
  canManageFacilities: boolean;
  canManageTournaments: boolean;
  canViewReports: boolean;
  canManageBookings: boolean;
  lastActiveAt: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminProfileSchema = new Schema<IAdminProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  permissions: [{
    type: String,
    enum: [
      'user_management',
      'facility_management', 
      'tournament_management',
      'booking_management',
      'report_viewing',
      'content_management',
      'system_settings'
    ]
  }],
  assignedTasks: [String],
  department: {
    type: String,
    enum: ['operations', 'customer_service', 'facilities', 'tournaments', 'technical'],
    default: 'operations'
  },
  managedFacilities: [{
    type: Schema.Types.ObjectId,
    ref: 'Facility'
  }],
  // Quick access boolean permissions
  canManageUsers: { type: Boolean, default: false },
  canManageFacilities: { type: Boolean, default: false },
  canManageTournaments: { type: Boolean, default: false },
  canViewReports: { type: Boolean, default: false },
  canManageBookings: { type: Boolean, default: true },
  lastActiveAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp on save
adminProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Sync permissions array with boolean fields
adminProfileSchema.pre('save', function(next) {
  const permissions = [];
  if (this.canManageUsers) permissions.push('user_management');
  if (this.canManageFacilities) permissions.push('facility_management');
  if (this.canManageTournaments) permissions.push('tournament_management');
  if (this.canViewReports) permissions.push('report_viewing');
  if (this.canManageBookings) permissions.push('booking_management');
  
  this.permissions = [...new Set([...this.permissions, ...permissions])];
  next();
});

export default mongoose.models.AdminProfile || mongoose.model<IAdminProfile>('AdminProfile', adminProfileSchema);
