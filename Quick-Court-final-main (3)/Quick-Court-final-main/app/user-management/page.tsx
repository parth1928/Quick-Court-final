"use client"

import { useState } from "react"
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
import { Search, Eye, UserCheck, UserX } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "User" | "Facility Owner"
  status: "Active" | "Banned"
  joinDate: string
  lastActive: string
  bookingHistory: {
    facility: string
    date: string
    sport: string
    status: string
  }[]
}

const usersData: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    role: "User",
    status: "Active",
    joinDate: "2023-06-15",
    lastActive: "2024-01-20",
    bookingHistory: [
      { facility: "Elite Sports Complex", date: "2024-01-18", sport: "Basketball", status: "Completed" },
      { facility: "Community Center", date: "2024-01-15", sport: "Tennis", status: "Completed" },
    ],
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@email.com",
    role: "Facility Owner",
    status: "Active",
    joinDate: "2023-03-22",
    lastActive: "2024-01-19",
    bookingHistory: [],
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol.davis@email.com",
    role: "User",
    status: "Banned",
    joinDate: "2023-08-10",
    lastActive: "2024-01-05",
    bookingHistory: [{ facility: "Premier Tennis Club", date: "2024-01-03", sport: "Tennis", status: "Cancelled" }],
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david.wilson@email.com",
    role: "User",
    status: "Active",
    joinDate: "2023-11-05",
    lastActive: "2024-01-21",
    bookingHistory: [
      { facility: "Elite Sports Complex", date: "2024-01-20", sport: "Volleyball", status: "Completed" },
      { facility: "Community Center", date: "2024-01-17", sport: "Basketball", status: "Completed" },
      { facility: "Premier Tennis Club", date: "2024-01-14", sport: "Tennis", status: "Completed" },
    ],
  },
  {
    id: "5",
    name: "Emma Brown",
    email: "emma.brown@email.com",
    role: "Facility Owner",
    status: "Active",
    joinDate: "2023-04-18",
    lastActive: "2024-01-20",
    bookingHistory: [],
  },
]

export default function UserManagement() {
  const [users, setUsers] = useState(usersData)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showBookingHistory, setShowBookingHistory] = useState(false)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "All" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: user.status === "Active" ? "Banned" : ("Active" as const) } : user,
      ),
    )
  }

  const viewBookingHistory = (user: User) => {
    setSelectedUser(user)
    setShowBookingHistory(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage users and facility owners</p>
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
                <SelectItem value="All">All Roles</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Facility Owner">Facility Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Facility Owner" ? "default" : "secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "default" : "destructive"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>{user.lastActive}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => viewBookingHistory(user)}>
                        <Eye className="h-4 w-4 mr-1" />
                        History
                      </Button>
                      <Button
                        variant={user.status === "Active" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.status === "Active" ? (
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
        </CardContent>
      </Card>

      {/* Booking History Modal */}
      <Dialog open={showBookingHistory} onOpenChange={setShowBookingHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking History - {selectedUser?.name}</DialogTitle>
            <DialogDescription>Complete booking history for this user</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <Badge variant={selectedUser.role === "Facility Owner" ? "default" : "secondary"}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={selectedUser.status === "Active" ? "default" : "destructive"}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-gray-600">{selectedUser.joinDate}</p>
                </div>
              </div>

              {selectedUser.bookingHistory.length > 0 ? (
                <div>
                  <h4 className="font-medium mb-3">Recent Bookings</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Facility</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Sport</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedUser.bookingHistory.map((booking, index) => (
                        <TableRow key={index}>
                          <TableCell>{booking.facility}</TableCell>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>{booking.sport}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === "Completed"
                                  ? "default"
                                  : booking.status === "Cancelled"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No booking history available</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
