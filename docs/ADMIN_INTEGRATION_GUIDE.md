# Admin System Integration Guide

## 🏗️ Complete Frontend, Backend & Database Integration

This guide shows you how to integrate the complete admin system into your Next.js application.

## 📁 Files Created/Modified

### Backend (API & Database)
- `models/AdminProfile.ts` - Admin profile schema
- `lib/admin-utils.ts` - Admin utility functions
- `lib/api/admin.ts` - Frontend API client
- `lib/admin-middleware.ts` - Admin permission middleware
- `app/api/admin/users/route.ts` - Create/get admin users
- `app/api/admin/users/list/route.ts` - List admin users with pagination
- `app/api/admin/users/[id]/route.ts` - Update/delete admin users
- `app/api/admin/stats/route.ts` - Admin statistics

### Frontend (Components & Pages)
- `components/admin/CreateAdminForm.tsx` - Form to create new admins
- `components/admin/AdminManagement.tsx` - Admin list and management
- `components/admin/AdminDashboard.tsx` - Admin statistics dashboard
- `hooks/use-admin.ts` - React hook for admin operations
- `app/admin-dashboard/page.tsx` - Updated with admin tabs

### Types & Utils
- `lib/types/admin.ts` - TypeScript interfaces
- `scripts/test-admin-integration.js` - Integration test script

## 🚀 Quick Start

### 1. Test the Database Integration

Run the integration test:
```bash
node scripts/test-admin-integration.js
```

### 2. Access the Admin Interface

Navigate to `/admin-dashboard` in your app and switch to the "Admin Management" tab.

### 3. Create Your First Admin

Use the API endpoint or the frontend form:

```typescript
// Via API
const response = await fetch('/api/admin/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Admin',
    email: 'john@admin.com',
    password: 'securepassword',
    phone: '+1234567890',
    department: 'operations',
    canManageUsers: true,
    canManageFacilities: true
  })
});
```

## 🔐 Authentication Integration

You need to implement authentication in `lib/admin-middleware.ts`:

```typescript
// Replace the placeholder function with your auth logic
function extractUserIdFromToken(authHeader: string): string | null {
  const token = authHeader.replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
}
```

## 🛡️ Protecting Admin Routes

Use the middleware to protect your admin API routes:

```typescript
import { withAdminAuth } from '@/lib/admin-middleware';

// Protect with admin role only
export const GET = withAdminAuth(async (request) => {
  // Your handler code
});

// Protect with specific permission
export const POST = withAdminAuth(async (request) => {
  // Your handler code
}, 'user_management');
```

## 📊 Frontend Integration Examples

### Using the Admin Hook

```typescript
import { useAdmin } from '@/hooks/use-admin';

function AdminComponent() {
  const { 
    admins, 
    loading, 
    createAdmin, 
    updateAdmin, 
    deleteAdmin, 
    stats 
  } = useAdmin();

  const handleCreateAdmin = async (data) => {
    try {
      await createAdmin(data);
      // Admin will be automatically refreshed
    } catch (error) {
      console.error('Failed to create admin:', error);
    }
  };

  return (
    <div>
      {loading ? 'Loading...' : `${admins.length} admins found`}
    </div>
  );
}
```

### Using the API Client Directly

```typescript
import { adminAPI } from '@/lib/api/admin';

// Get admin list with filters
const admins = await adminAPI.getAdminList({
  page: 1,
  limit: 10,
  department: 'facilities',
  search: 'john'
});

// Get admin statistics
const stats = await adminAPI.getAdminStats();

// Update admin permissions
await adminAPI.updateAdmin(adminId, {
  canManageUsers: true,
  department: 'operations'
});
```

## 🔄 Database Queries

### MongoDB Aggregation Examples

```javascript
// Get all admins with their profiles
db.users.aggregate([
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

// Get admins by department
db.adminprofiles.find({ department: 'facilities' }).populate('userId');

// Get permission statistics
db.adminprofiles.aggregate([
  {
    $group: {
      _id: '$department',
      count: { $sum: 1 },
      canManageUsers: { $sum: { $cond: ['$canManageUsers', 1, 0] } }
    }
  }
]);
```

## 🎨 UI Components Usage

### Admin Dashboard Tab

The admin dashboard is integrated into your existing admin page with tabs:

- **Overview**: System overview
- **Admin Stats**: Statistics and charts
- **Admin Management**: Create, edit, delete admins

### Standalone Usage

You can also use components independently:

```tsx
import { AdminManagement } from '@/components/admin/AdminManagement';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { CreateAdminForm } from '@/components/admin/CreateAdminForm';

// Use in any page
<AdminManagement />
<AdminDashboard />
<CreateAdminForm onSuccess={() => console.log('Admin created!')} />
```

## 🔧 Customization

### Adding New Permissions

1. Update the `AdminProfile` schema in `models/AdminProfile.ts`
2. Add the permission to the enum in `lib/types/admin.ts`
3. Update the form in `components/admin/CreateAdminForm.tsx`
4. Update the middleware in `lib/admin-middleware.ts`

### Adding New Departments

Update the department enum in both:
- `models/AdminProfile.ts`
- `lib/types/admin.ts`

### Custom Fields

Add fields to the `AdminProfile` schema and update the TypeScript interfaces.

## 🚨 Security Considerations

1. **Authentication**: Implement proper JWT token validation
2. **Authorization**: Use the middleware to check permissions
3. **Input Validation**: Validate all inputs on both client and server
4. **Rate Limiting**: Add rate limiting to admin creation endpoints
5. **Audit Logging**: Log admin actions for security monitoring

## 📱 Mobile Responsiveness

All admin components are built with responsive design using Tailwind CSS and shadcn/ui components.

## 🧪 Testing

### Run Integration Test
```bash
node scripts/test-admin-integration.js
```

### Manual Testing Checklist

- [ ] Create admin user via API
- [ ] Create admin user via form
- [ ] List admins with pagination
- [ ] Filter admins by department
- [ ] Search admins by name/email
- [ ] Update admin permissions
- [ ] Delete admin user
- [ ] View admin statistics
- [ ] Test permission middleware

## 🔄 Next Steps

1. **Authentication**: Implement JWT token validation in middleware
2. **Navigation**: Add admin routes to your app navigation
3. **Roles**: Extend with owner role management
4. **Audit**: Add activity logging for admin actions
5. **Notifications**: Add real-time notifications for admin activities
6. **Export**: Add CSV export for admin lists
7. **Bulk Operations**: Add bulk admin operations
8. **Email**: Add email invitations for new admins

## 💡 Tips

- Use the `useAdmin` hook for state management
- All components are built with shadcn/ui for consistency
- API responses include proper error handling
- Pagination is built into the list components
- TypeScript provides full type safety

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure MongoDB is running and MONGODB_URI is set
2. **Missing Dependencies**: Install all required packages
3. **Import Errors**: Check file paths and ensure all files are created
4. **Permission Denied**: Implement authentication in middleware
5. **UI Issues**: Ensure shadcn/ui components are properly installed

### Debug Mode

Enable debug logging in the API routes by adding:
```typescript
console.log('Admin API Debug:', { request: request.url, body: await request.json() });
```
