import { Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'owner';
  avatar?: string;
  isBanned: boolean;
  bookingCount: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProfile {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  permissions: string[];
  assignedTasks: string[];
  department: 'operations' | 'customer_service' | 'facilities' | 'tournaments' | 'technical';
  managedFacilities: Types.ObjectId[];
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

export interface AdminUser {
  user: User;
  adminProfile: AdminProfile;
}

export type PermissionType = 
  | 'user_management'
  | 'facility_management' 
  | 'tournament_management'
  | 'booking_management'
  | 'report_viewing'
  | 'content_management'
  | 'system_settings';

export type DepartmentType = 
  | 'operations' 
  | 'customer_service' 
  | 'facilities' 
  | 'tournaments' 
  | 'technical';
