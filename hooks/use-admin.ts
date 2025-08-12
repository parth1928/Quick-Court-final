'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api/admin';
import { User, AdminProfile } from '@/lib/types/admin';

export interface UseAdminHookReturn {
  admins: (User & { adminProfile: AdminProfile })[];
  loading: boolean;
  error: string | null;
  createAdmin: (data: any) => Promise<void>;
  updateAdmin: (id: string, data: any) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
  refreshAdmins: () => Promise<void>;
  stats: any;
  fetchStats: () => Promise<void>;
}

export function useAdmin(): UseAdminHookReturn {
  const [admins, setAdmins] = useState<(User & { adminProfile: AdminProfile })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(null);

  const refreshAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAdminList();
      setAdmins(response.data.admins);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getAdminStats();
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    }
  };

  const createAdmin = async (data: any) => {
    try {
      setError(null);
      await adminAPI.createAdmin(data);
      await refreshAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
      throw err;
    }
  };

  const updateAdmin = async (id: string, data: any) => {
    try {
      setError(null);
      await adminAPI.updateAdmin(id, data);
      await refreshAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update admin');
      throw err;
    }
  };

  const deleteAdmin = async (id: string) => {
    try {
      setError(null);
      await adminAPI.deleteAdmin(id);
      await refreshAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin');
      throw err;
    }
  };

  useEffect(() => {
    refreshAdmins();
    fetchStats();
  }, []);

  return {
    admins,
    loading,
    error,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    refreshAdmins,
    stats,
    fetchStats,
  };
}
