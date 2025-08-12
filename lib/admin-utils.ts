import User from '@/models/User';
import AdminProfile from '@/models/AdminProfile';
import { connectDB } from '@/lib/db';

export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  phone: string;
  department?: string;
  permissions?: string[];
  canManageUsers?: boolean;
  canManageFacilities?: boolean;
  canManageTournaments?: boolean;
  canViewReports?: boolean;
  canManageBookings?: boolean;
  managedFacilities?: string[];
  notes?: string;
}

export async function createAdminUser(adminData: CreateAdminData) {
  await connectDB();

  // Check if user already exists
  const existingUser = await User.findOne({ email: adminData.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create the user with admin role
  const user = new User({
    name: adminData.name,
    email: adminData.email,
    password: adminData.password,
    phone: adminData.phone,
    role: 'admin'
  });

  await user.save();

  // Create the admin profile
  const adminProfile = new AdminProfile({
    userId: user._id,
    department: adminData.department || 'operations',
    permissions: adminData.permissions || [],
    canManageUsers: adminData.canManageUsers || false,
    canManageFacilities: adminData.canManageFacilities || false,
    canManageTournaments: adminData.canManageTournaments || false,
    canViewReports: adminData.canViewReports || false,
    canManageBookings: adminData.canManageBookings ?? true,
    managedFacilities: adminData.managedFacilities || [],
    notes: adminData.notes || ''
  });

  await adminProfile.save();

  return {
    user: user.toObject(),
    adminProfile: adminProfile.toObject()
  };
}

export async function getAdminWithProfile(userId: string) {
  await connectDB();
  
  const user = await User.findById(userId);
  if (!user || user.role !== 'admin') {
    return null;
  }

  const adminProfile = await AdminProfile.findOne({ userId }).populate('managedFacilities');
  
  return {
    user: user.toObject(),
    adminProfile: adminProfile?.toObject() || null
  };
}

export async function updateAdminPermissions(userId: string, permissions: Partial<CreateAdminData>) {
  await connectDB();
  
  const adminProfile = await AdminProfile.findOneAndUpdate(
    { userId },
    { $set: permissions },
    { new: true }
  );

  return adminProfile;
}
