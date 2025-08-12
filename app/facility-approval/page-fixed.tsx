"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Eye, Check, X, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PendingFacility {
  _id: string
  name: string
  owner: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  location: string
  createdAt: string
  approvalStatus: "pending" | "approved" | "rejected"
  status: string
  description?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
  }
  sports: string[]
  amenities: string[]
  image?: string
  approvedAt?: string
  rejectionReason?: string
}

export default function FacilityApprovalPage() {
  const { toast } = useToast()
  const [facilities, setFacilities] = useState<PendingFacility[]>([])
  const [filteredFacilities, setFilteredFacilities] = useState<PendingFacility[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedFacility, setSelectedFacility] = useState<PendingFacility | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch facilities
  const fetchFacilities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/facilities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch facilities')
      }
      
      const data = await response.json()
      setFacilities(data.facilities || [])
    } catch (error: any) {
      console.error('Error fetching facilities:', error)
      toast({
        title: "Error",
        description: "Failed to load facilities",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter facilities based on selected status
  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredFacilities(facilities)
    } else {
      setFilteredFacilities(facilities.filter(facility => facility.approvalStatus === selectedStatus))
    }
  }, [facilities, selectedStatus])

  // Load facilities on component mount
  useEffect(() => {
    fetchFacilities()
  }, [])

  const updateFacilityStatus = async (facilityId: string, status: string, reason?: string) => {
    const response = await fetch(`/api/admin/facilities/${facilityId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        approvalStatus: status,
        rejectionReason: reason
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update facility')
    }

    return response.json()
  }

  const confirmAction = async () => {
    if (!selectedFacility || !actionType) return

    setProcessing(true)
    
    try {
      const result = await updateFacilityStatus(selectedFacility._id, actionType, rejectionReason)
      
      toast({
        title: "Success",
        description: result.message,
      })

      // Refresh the facilities list
      await fetchFacilities()
      
      // Close dialog
      setIsActionDialogOpen(false)
      setSelectedFacility(null)
      setActionType(null)
      setRejectionReason("")
      
    } catch (error: any) {
      console.error('Error updating facility:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleView = (facility: PendingFacility) => {
    setSelectedFacility(facility)
    setIsViewDialogOpen(true)
  }

  const handleApprove = (facility: PendingFacility) => {
    setSelectedFacility(facility)
    setActionType("approved")
    setIsActionDialogOpen(true)
  }

  const handleReject = (facility: PendingFacility) => {
    setSelectedFacility(facility)
    setActionType("rejected")
    setIsActionDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAddress = (address?: { street?: string; city?: string; state?: string; postalCode?: string }) => {
    if (!address) return 'N/A'
    const parts = [address.street, address.city, address.state, address.postalCode].filter(Boolean)
    return parts.join(', ') || 'N/A'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading facilities...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Facility Approval</h1>
          <p className="text-gray-600">Review and approve facility applications</p>
        </div>
        <Button onClick={fetchFacilities} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facilities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {facilities.filter(f => f.approvalStatus === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {facilities.filter(f => f.approvalStatus === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {facilities.filter(f => f.approvalStatus === "rejected").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                onClick={() => setSelectedStatus(status)}
                className="capitalize"
              >
                {status === "all" ? "All" : status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Facilities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Facility Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFacilities.map((facility) => (
                <TableRow key={facility._id}>
                  <TableCell className="font-medium">{facility.name}</TableCell>
                  <TableCell>{facility.owner.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {facility.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(facility.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(facility.approvalStatus)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(facility)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {facility.approvalStatus === "pending" && (
                        <>
                          <Button variant="default" size="sm" onClick={() => handleApprove(facility)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleReject(facility)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFacility?.name}</DialogTitle>
            <DialogDescription>Facility Details</DialogDescription>
          </DialogHeader>
          {selectedFacility && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Owner Information</h4>
                  <p className="text-sm text-gray-600">{selectedFacility.owner.name}</p>
                  <p className="text-sm text-gray-600">{selectedFacility.owner.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Date Submitted</h4>
                  <p className="text-sm text-gray-600">{formatDate(selectedFacility.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Status</h4>
                  {getStatusBadge(selectedFacility.approvalStatus)}
                </div>
                <div>
                  <h4 className="font-semibold">Location</h4>
                  <p className="text-sm text-gray-600">{selectedFacility.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Address</h4>
                  <p className="text-sm text-gray-600">{formatAddress(selectedFacility.address)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Description</h4>
                  <p className="text-sm text-gray-600">{selectedFacility.description || 'No description provided'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Sports</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedFacility.sports.map((sport, index) => (
                      <Badge key={index} variant="secondary">{sport}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Amenities</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedFacility.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline">{amenity}</Badge>
                    ))}
                  </div>
                </div>
                {selectedFacility.rejectionReason && (
                  <div>
                    <h4 className="font-semibold">Rejection Reason</h4>
                    <p className="text-sm text-gray-600">{selectedFacility.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approved" ? "Approve Facility" : "Reject Facility"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approved" 
                ? "Are you sure you want to approve this facility?" 
                : "Please provide a reason for rejection."
              }
            </DialogDescription>
          </DialogHeader>
          {actionType === "rejected" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={processing || (actionType === "rejected" && !rejectionReason.trim())}
              variant={actionType === "approved" ? "default" : "destructive"}
            >
              {processing ? "Processing..." : actionType === "approved" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
