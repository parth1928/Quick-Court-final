import { AdminProfile, User, DepartmentType, PermissionType } from '@/lib/types/admin';

// API Response types
export interface AdminListResponse {
  success: boolean;
  data: {
    admins: (User & { adminProfile: AdminProfile })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AdminStatsResponse {
  success: boolean;
  data: {
    generalStats: {
      totalAdmins: number;
      activeAdmins: number;
      departmentCounts: Record<string, number>;
    };
    permissionStats: {
      canManageUsers: number;
      canManageFacilities: number;
      canManageTournaments: number;
      canViewReports: number;
      canManageBookings: number;
    };
  };
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  department?: DepartmentType;
  permissions?: PermissionType[];
  canManageUsers?: boolean;
  canManageFacilities?: boolean;
  canManageTournaments?: boolean;
  canViewReports?: boolean;
  canManageBookings?: boolean;
  managedFacilities?: string[];
  notes?: string;
}

class AdminAPI {
  private baseUrl = '/api/admin';

  async createAdmin(data: CreateAdminRequest) {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create admin');
    }

    return response.json();
  }

  async getAdminList(params: {
    page?: number;
    limit?: number;
    department?: string;
    search?: string;
  } = {}): Promise<AdminListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/users/list?${searchParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin list');
    }

    return response.json();
  }

  async getAdminById(id: string) {
    const response = await fetch(`${this.baseUrl}/users?userId=${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin');
    }

    return response.json();
  }

  async updateAdmin(id: string, data: Partial<CreateAdminRequest>) {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update admin');
    }

    return response.json();
  }

  async deleteAdmin(id: string) {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete admin');
    }

    return response.json();
  }

  async getAdminStats(): Promise<AdminStatsResponse> {
    const response = await fetch(`${this.baseUrl}/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin stats');
    }

    return response.json();
  }
}

export const adminAPI = new AdminAPI();
