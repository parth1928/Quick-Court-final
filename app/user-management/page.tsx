"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Eye, UserCheck, UserX, RefreshCw, AlertCircle } from "lucide-react"

interface User {
  id: string
  _id: string  // Keep for backwards compatibility
  name: string
  email: string
  role: string
  status: string
  phone?: string
  createdAt: string
  updatedAt?: string
  lastActiveAt?: string
}

interface UserManagementResponse {
  success: boolean
  users: User[]
  pagination: {
    currentPage: number
    totalPages: number
    totalUsers: number
    limit: number
  }
  error?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    userId: string
    action: string
    userName: string
  } | null>(null)

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      })
      
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data: UserManagementResponse = await response.json()
      
      if (data.success) {
        setUsers(data.users)
        setTotalPages(data.pagination.totalPages)
        setTotalUsers(data.pagination.totalUsers)
      } else {
        throw new Error(data.error || 'Failed to fetch users')
      }
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter])

  // Handle user actions (ban/unban, role change)
  const handleUserAction = async (userId: string, action: string, newRole?: string) => {
    try {
      setActionLoading(userId)
      setError(null)
      setSuccessMessage(null)
      
      console.log(`Attempting to ${action} user ${userId}`, { action, newRole })
      console.log('Auth token available:', !!localStorage.getItem('token'))
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ 
          action,
          newRole 
        }),
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to update user`;
        try {
          const responseText = await response.text();
          console.error('API Error Response:', responseText);
          
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            // Not JSON, use the text as is if it's not HTML
            if (!responseText.includes('<!DOCTYPE html>')) {
              errorMessage = responseText || errorMessage;
            }
          }
        } catch (readError) {
          console.error('Failed to read response:', readError);
        }
        
        console.error('User update failed:', errorMessage);
        setError(errorMessage);
        setActionLoading(null);
        return;
      }
      
      const result = await response.json()
      console.log('API Response:', result)
      
      if (result.success) {
        setSuccessMessage(result.message || `User ${action} successful`)
        // Refresh users list
        await fetchUsers()
        setSelectedUser(null)
        setConfirmAction(null)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        console.error('API returned failure:', result.error);
        setError(result.error || 'Failed to update user');
      }
    } catch (err: any) {
      console.error('Error updating user:', err)
      setError(err.message || 'Failed to update user')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle ban action with confirmation
  const handleBanUser = (user: User) => {
    setConfirmAction({
      userId: user.id,
      action: user.status === "active" ? "ban" : "unban",
      userName: user.name
    })
  }

  // Direct ban/unban without confirmation (single click)
  const handleDirectBanUser = async (user: User) => {
    const action = user.status === "active" ? "ban" : "unban";
    await handleUserAction(user.id, action);
  }

  // Load users on component mount and when filters change
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1) // Reset to first page on new search
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Loading user data...</p>
        </div>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Error loading user data</p>
        </div>
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
            <Button 
              onClick={fetchUsers} 
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center text-green-800">
              <UserCheck className="h-5 w-5 mr-2" />
              {successMessage}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users, roles, and access permissions</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Users: {totalUsers}
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="owner">Facility Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={fetchUsers} 
              variant="outline"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id || `user-${index}`}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "owner" ? "default" : user.role === "admin" ? "destructive" : "secondary"}>
                      {user.role === "owner" ? "Facility Owner" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant={user.status === "active" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleDirectBanUser(user)}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : user.status === "active" ? (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Ban
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Unban
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details - {selectedUser?.name}</DialogTitle>
            <DialogDescription>Manage user information and permissions</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-gray-600">{selectedUser.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Current Role</p>
                  <Badge variant={selectedUser.role === "owner" ? "default" : selectedUser.role === "admin" ? "destructive" : "secondary"}>
                    {selectedUser.role === "owner" ? "Facility Owner" : selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={selectedUser.status === "active" ? "default" : "destructive"}>
                    {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-gray-600">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Active</p>
                  <p className="text-sm text-gray-600">
                    {selectedUser.lastActiveAt ? new Date(selectedUser.lastActiveAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>

              {/* Role Management */}
              <div className="space-y-4">
                <h4 className="font-medium">Role Management</h4>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedUser.role === "user" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUserAction(selectedUser.id, "changeRole", "user")}
                    disabled={actionLoading === selectedUser.id}
                  >
                    Make User
                  </Button>
                  <Button
                    variant={selectedUser.role === "owner" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUserAction(selectedUser.id, "changeRole", "owner")}
                    disabled={actionLoading === selectedUser.id}
                  >
                    Make Facility Owner
                  </Button>
                  <Button
                    variant={selectedUser.role === "admin" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUserAction(selectedUser.id, "changeRole", "admin")}
                    disabled={actionLoading === selectedUser.id}
                  >
                    Make Admin
                  </Button>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-4">
                <h4 className="font-medium">Account Actions</h4>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedUser.status === "active" ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleBanUser(selectedUser)}
                    disabled={actionLoading === selectedUser.id}
                  >
                    {actionLoading === selectedUser.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : selectedUser.status === "active" ? (
                      <UserX className="h-4 w-4 mr-2" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-2" />
                    )}
                    {selectedUser.status === "active" ? "Ban User" : "Unban User"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUserAction(selectedUser.id, "suspend")}
                    disabled={actionLoading === selectedUser.id || selectedUser.status === "suspended"}
                  >
                    Suspend Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Ban/Unban */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmAction && (
                <>
                  Are you sure you want to {confirmAction.action} <strong>{confirmAction.userName}</strong>?
                  {confirmAction.action === 'ban' && (
                    <span className="block mt-2 text-red-600 text-sm">
                      This user will no longer be able to access the platform.
                    </span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction?.action === 'ban' ? 'destructive' : 'default'}
              onClick={() => {
                if (confirmAction) {
                  handleUserAction(confirmAction.userId, confirmAction.action)
                }
              }}
              disabled={!!actionLoading}
            >
              {actionLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm {confirmAction?.action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
