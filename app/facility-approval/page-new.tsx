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
import { MapPin, Calendar, Eye, Check, X, RefreshCw, Building, User, Clock } from "lucide-react"
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
  const [loading, setLoading] = useState(true)
  const [selectedFacility, setSelectedFacility] = useState<PendingFacility | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "approved" | "rejected">("pending")

  // Fetch facilities from API
  const fetchFacilities = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/facilities/approval?status=${selectedStatus}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch facilities')
      }
      
      const data = await response.json()
      setFacilities(data.facilities || [])
    } catch (error: any) {
      console.error('Error fetching facilities:', error)
      toast({
        title: "Error",
        description: "Failed to fetch facilities. Please try again.",
        variant: "destructive"
      })
      setFacilities([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch facilities on component mount and when status changes
  useEffect(() => {
    fetchFacilities()
  }, [selectedStatus])

  const handleAction = async (facility: PendingFacility, action: "approve" | "reject") => {
    setSelectedFacility(facility)
    setActionType(action)
    setIsActionDialogOpen(true)
    setRejectionReason("")
  }

  const confirmAction = async () => {
    if (!selectedFacility || !actionType) return

    try {
      setProcessing(true)
      
      const requestBody = {
        action: actionType,
        reason: actionType === 'reject' ? rejectionReason : undefined,
        adminId: 'admin_user_id' // Replace with actual admin user ID from auth
      }

      const response = await fetch(`/api/admin/facilities/approval/${selectedFacility._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update facility')
      }

      const result = await response.json()
      
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

  const getFullAddress = (facility: PendingFacility) => {
    if (!facility.address) return facility.location
    
    const { street, city, state, postalCode } = facility.address
    const parts = [street, city, state, postalCode].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : facility.location
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading facilities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Facility Approval</h1>
          <p className="text-muted-foreground">Review and approve facility registrations</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('pending')}
          >
            Pending
          </Button>
          <Button
            variant={selectedStatus === 'approved' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('approved')}
          >
            Approved
          </Button>
          <Button
            variant={selectedStatus === 'rejected' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('rejected')}
          >
            Rejected
          </Button>
          <Button variant="outline" onClick={fetchFacilities}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Facilities Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Facilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {facilities.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No {selectedStatus} facilities found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Sports</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facilities.map((facility) => (
                  <TableRow key={facility._id}>
                    <TableCell className="font-medium">{facility.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{facility.owner.name}</div>
                          <div className="text-sm text-gray-500">{facility.owner.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {facility.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {facility.sports.slice(0, 2).map((sport) => (
                          <Badge key={sport} variant="secondary" className="text-xs">
                            {sport}
                          </Badge>
                        ))}
                        {facility.sports.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{facility.sports.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(facility.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(facility.approvalStatus)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(facility)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {facility.approvalStatus === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(facility, 'approve')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(facility, 'reject')}
                              className="text-red-600 hover:text-red-700"
                            >
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
          )}
        </CardContent>
      </Card>

      {/* View Facility Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFacility?.name}</DialogTitle>
            <DialogDescription>Facility Details</DialogDescription>
          </DialogHeader>
          
          {selectedFacility && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Owner</Label>
                  <p className="text-sm">{selectedFacility.owner.name}</p>
                  <p className="text-xs text-gray-500">{selectedFacility.owner.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedFacility.approvalStatus)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm">{getFullAddress(selectedFacility)}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm">{selectedFacility.description || 'No description provided'}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Sports Offered</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedFacility.sports.map((sport) => (
                    <Badge key={sport} variant="secondary">{sport}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Amenities</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedFacility.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline">{amenity}</Badge>
                  ))}
                </div>
              </div>

              {selectedFacility.rejectionReason && (
                <div>
                  <Label className="text-sm font-medium text-red-600">Rejection Reason</Label>
                  <p className="text-sm text-red-600">{selectedFacility.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Facility' : 'Reject Facility'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this facility?'
                : 'Please provide a reason for rejecting this facility.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {actionType === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why this facility is being rejected..."
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={processing || (actionType === 'reject' && !rejectionReason.trim())}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {actionType === 'approve' ? 'Approving...' : 'Rejecting...'}
                </>
              ) : (
                actionType === 'approve' ? 'Approve' : 'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
