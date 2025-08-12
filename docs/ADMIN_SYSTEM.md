# Admin User System Documentation

## Overview
This system extends your existing User model to support admin users with detailed profiles and permissions. It uses a single `users` collection with a `role` field, and links admin users to an `adminProfile` collection for additional admin-specific data.

## Schema Structure

### Users Collection (existing, with role field)
```javascript
{
  _id: ObjectId,
  name: "John Admin",
  email: "admin@example.com",
  password: "hashedPassword",
  phone: "+1234567890",
  role: "admin", // "user" | "admin" | "owner"
  avatar: "/placeholder-user.jpg",
  isBanned: false,
  bookingCount: 0,
  lastLoginAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### AdminProfile Collection (new)
```javascript
{
  _id: ObjectId,
  userId: ObjectId("ref to users collection"),
  permissions: ["user_management", "facility_management"],
  assignedTasks: ["Review new facility applications", "Handle user complaints"],
  department: "operations", // "operations" | "customer_service" | "facilities" | "tournaments" | "technical"
  managedFacilities: [ObjectId("ref to facilities")],
  canManageUsers: true,
  canManageFacilities: true,
  canManageTournaments: false,
  canViewReports: true,
  canManageBookings: true,
  lastActiveAt: new Date(),
  notes: "Senior admin with full user management access",
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## API Endpoints

### Create Admin User
**POST** `/api/admin/users`

```javascript
// Request body
{
  "name": "Jane Admin",
  "email": "jane@example.com",
  "password": "securePassword123",
  "phone": "+1987654321",
  "department": "facilities",
  "canManageUsers": false,
  "canManageFacilities": true,
  "canManageTournaments": false,
  "canViewReports": true,
  "canManageBookings": true,
  "notes": "Facility management specialist"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "Jane Admin",
      "email": "jane@example.com",
      "phone": "+1987654321",
      "role": "admin",
      "avatar": "/placeholder-user.jpg",
      "isBanned": false,
      "bookingCount": 0,
      "createdAt": "2025-08-12T...",
      "updatedAt": "2025-08-12T..."
    },
    "adminProfile": {
      "_id": "...",
      "userId": "...",
      "permissions": ["facility_management", "report_viewing", "booking_management"],
      "assignedTasks": [],
      "department": "facilities",
      "managedFacilities": [],
      "canManageUsers": false,
      "canManageFacilities": true,
      "canManageTournaments": false,
      "canViewReports": true,
      "canManageBookings": true,
      "lastActiveAt": "2025-08-12T...",
      "notes": "Facility management specialist",
      "createdAt": "2025-08-12T...",
      "updatedAt": "2025-08-12T..."
    }
  }
}
```

### Get Admin User with Profile
**GET** `/api/admin/users?userId=USER_ID`

```javascript
// Response (same structure as create response)
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "adminProfile": { /* admin profile object */ }
  }
}
```

## Usage Examples

### 1. Creating an Admin User Programmatically
```typescript
import { createAdminUser } from '@/lib/admin-utils';

const newAdmin = await createAdminUser({
  name: "System Admin",
  email: "sysadmin@example.com",
  password: "strongPassword123",
  phone: "+1555000000",
  department: "technical",
  canManageUsers: true,
  canManageFacilities: true,
  canManageTournaments: true,
  canViewReports: true,
  canManageBookings: true,
  notes: "Full system administrator"
});
```

### 2. Fetching Admin Data
```typescript
import { getAdminWithProfile } from '@/lib/admin-utils';

const adminData = await getAdminWithProfile(userId);
if (adminData) {
  console.log('Admin:', adminData.user.name);
  console.log('Department:', adminData.adminProfile.department);
  console.log('Permissions:', adminData.adminProfile.permissions);
}
```

### 3. Using in React Component
```typescript
// Example API call from frontend
const createAdmin = async (adminData) => {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adminData),
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Admin created:', result.data);
  } else {
    console.error('Error:', result.error);
  }
};
```

### 4. Querying with Mongoose
```typescript
import User from '@/models/User';
import AdminProfile from '@/models/AdminProfile';

// Find all admin users with their profiles
const admins = await User.aggregate([
  { $match: { role: 'admin' } },
  {
    $lookup: {
      from: 'adminprofiles',
      localField: '_id',
      foreignField: 'userId',
      as: 'adminProfile'
    }
  },
  { $unwind: '$adminProfile' }
]);

// Find admins by department
const facilityAdmins = await AdminProfile.find({ 
  department: 'facilities' 
}).populate('userId', 'name email phone');

// Find admins with specific permissions
const userManagers = await AdminProfile.find({
  canManageUsers: true
}).populate('userId');
```

## Permission System

The system includes both granular permissions array and boolean flags for common actions:

- **permissions**: Array of specific permission strings
- **canManageUsers**: Quick boolean for user management access
- **canManageFacilities**: Quick boolean for facility management access
- **canManageTournaments**: Quick boolean for tournament management access
- **canViewReports**: Quick boolean for report viewing access
- **canManageBookings**: Quick boolean for booking management access

## Integration Notes

1. **Existing User Model**: The system extends your existing User model without breaking changes
2. **Role-Based Access**: Use the `role` field in User model for basic role checking
3. **Detailed Permissions**: Use AdminProfile for granular permission checking
4. **Mongoose Population**: AdminProfile references User via `userId` field
5. **Type Safety**: TypeScript interfaces provided in `/lib/types/admin.ts`

## Next Steps

1. Add middleware to check admin permissions in protected routes
2. Create admin dashboard components
3. Add bulk admin operations
4. Implement admin activity logging
5. Add admin invitation system via email
