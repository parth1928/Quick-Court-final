'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI, CreateAdminRequest } from '@/lib/api/admin';
import { DepartmentType } from '@/lib/types/admin';
import { useToast } from '@/hooks/use-toast';

interface CreateAdminFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateAdminForm({ onSuccess, onCancel }: CreateAdminFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAdminRequest>({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'operations',
    canManageUsers: false,
    canManageFacilities: false,
    canManageTournaments: false,
    canViewReports: false,
    canManageBookings: true,
    notes: ''
  });

  const departments: { value: DepartmentType; label: string }[] = [
    { value: 'operations', label: 'Operations' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'facilities', label: 'Facilities' },
    { value: 'tournaments', label: 'Tournaments' },
    { value: 'technical', label: 'Technical' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminAPI.createAdmin(formData);
      toast({
        title: 'Success',
        description: 'Admin user created successfully',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create admin',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateAdminRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [permission]: checked
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Admin User</CardTitle>
        <CardDescription>
          Create a new admin user with specific permissions and department assignment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value as DepartmentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canManageUsers"
                  checked={formData.canManageUsers}
                  onCheckedChange={(checked) => handlePermissionChange('canManageUsers', checked)}
                />
                <Label htmlFor="canManageUsers">Manage Users</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canManageFacilities"
                  checked={formData.canManageFacilities}
                  onCheckedChange={(checked) => handlePermissionChange('canManageFacilities', checked)}
                />
                <Label htmlFor="canManageFacilities">Manage Facilities</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canManageTournaments"
                  checked={formData.canManageTournaments}
                  onCheckedChange={(checked) => handlePermissionChange('canManageTournaments', checked)}
                />
                <Label htmlFor="canManageTournaments">Manage Tournaments</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canViewReports"
                  checked={formData.canViewReports}
                  onCheckedChange={(checked) => handlePermissionChange('canViewReports', checked)}
                />
                <Label htmlFor="canViewReports">View Reports</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canManageBookings"
                  checked={formData.canManageBookings}
                  onCheckedChange={(checked) => handlePermissionChange('canManageBookings', checked)}
                />
                <Label htmlFor="canManageBookings">Manage Bookings</Label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this admin user..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Admin'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
