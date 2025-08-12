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
import { MapPin, Calendar, Eye, Check, X, RefreshCw, Building, User, Clock, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PendingVenue {
  _id: string
  name: string
  owner: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  shortLocation: string
  fullAddress: string
  createdAt: string
  approvalStatus: "pending" | "approved" | "rejected"
  status: string
  description?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
  }
  sports: string[]
  amenities: string[]
  images?: string[]
  photos?: string[]
  startingPrice: number
  rating: number
  reviewCount: number
  contactPhone?: string
  contactEmail?: string
  approvedAt?: string
  rejectionReason?: string
}

export default function VenueApprovalPage() {
  const { toast } = useToast()
  const [venues, setVenues] = useState<PendingVenue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState<PendingVenue | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [userRole, setUserRole] = useState<string | null>(null)

  // Check admin access on mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        
        if (user.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "You must be an admin to access this page.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page.",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error('❌ Error checking admin access:', e);
      toast({
        title: "Authentication Error",
        description: "Please log in again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Fetch venues from API
  const fetchVenues = async () => {
    try {
      setLoading(true)
      
      // Check if user is authenticated
      const userStr = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      console.log('🔐 Authentication check:', { 
        hasUser: !!userStr, 
        hasToken: !!token,
        tokenLength: token?.length 
      })
      
      if (!userStr || !token) {
        toast({
          title: "Authentication Required",
          description: "Please log in as an admin to access venue approvals.",
          variant: "destructive"
        })
        return
      }
      
      const user = JSON.parse(userStr)
      console.log('👤 Current user:', { role: user.role, email: user.email })
      
      if (user.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Only admins can access venue approvals.",
          variant: "destructive"
        })
        return
      }
      
      console.log('🔍 Fetching venues with status:', selectedStatus)
      
      // First test authentication with a simple endpoint
      console.log('🧪 Testing authentication...')
      const testResponse = await fetch('/api/admin/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('🧪 Test response status:', testResponse.status)
      
      if (!testResponse.ok) {
        const testError = await testResponse.text()
        console.error('🧪 Authentication test failed:', testError)
        toast({
          title: "Authentication Failed",
          description: "Please log in again as admin.",
          variant: "destructive"
        })
        return
      }
      
      const testData = await testResponse.json()
      console.log('🧪 Authentication test passed:', testData)
      
      // Now fetch venues
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      console.log('📡 Making API request to:', `/api/admin/venues/approval?status=${selectedStatus}`)
      
      const response = await fetch(`/api/admin/venues/approval?status=${selectedStatus}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      })
      
      console.log('📡 API Response status:', response.status)
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to fetch venues`
        let errorData = {}
        
        try {
          const responseText = await response.text()
          console.log('📄 Raw response text:', responseText)
          
          if (responseText) {
            try {
              errorData = JSON.parse(responseText)
              console.error('❌ API Error:', errorData)
              if (typeof errorData === 'object' && errorData && ('error' in errorData || 'message' in errorData)) {
                errorMessage = (errorData as any).error || (errorData as any).message || errorMessage
              }
            } catch (jsonError) {
              console.error('❌ Response is not JSON:', responseText)
              errorMessage = responseText.includes('<!DOCTYPE html>') 
                ? 'Server returned HTML instead of JSON - check server logs'
                : responseText
            }
          }
        } catch (parseError) {
          console.error('❌ Error reading response:', parseError)
        }
        
        // Handle specific status codes
        if (response.status === 401) {
          errorMessage = "Authentication failed. Please log in again."
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        } else if (response.status === 403) {
          errorMessage = "Access denied. Admin privileges required."
        } else if (response.status === 404) {
          errorMessage = "Venue approval API not found."
        } else if (response.status === 500) {
          errorMessage = "Server error. Please check server logs."
        }
        
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      console.log('✅ Fetched venues successfully:', { 
        count: data.venues?.length || 0, 
        status: selectedStatus,
        dataKeys: Object.keys(data)
      })
      setVenues(data.venues || [])
      
      if (data.venues && data.venues.length === 0) {
        toast({
          title: "No Venues Found",
          description: `No ${selectedStatus} venues found. You can create sample venues using the script.`,
        })
      }
      
    } catch (error: any) {
      console.error('💥 Error in fetchVenues:', error)
      toast({
        title: "Error Fetching Venues",
        description: error.message || "Failed to fetch venues. Please check the console for details.",
        variant: "destructive"
      })
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch venues on component mount and when status changes
  useEffect(() => {
    fetchVenues()
  }, [selectedStatus])

  const handleAction = async (venue: PendingVenue, action: "approve" | "reject") => {
    setSelectedVenue(venue)
    setActionType(action)
    setIsActionDialogOpen(true)
    setRejectionReason("")
  }

  const confirmAction = async () => {
    if (!selectedVenue || !actionType) return

    try {
      setProcessing(true)
      
      // Get admin ID from localStorage
      let adminId = 'admin_user_id'; // fallback
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          adminId = user.userId || user._id;
        }
      } catch (e) {
        console.log('Could not get admin ID from localStorage, using fallback');
      }
      
      const requestBody = {
        action: actionType,
        reason: actionType === 'reject' ? rejectionReason : undefined,
        adminId: adminId
      }

      console.log('🚀 Sending approval request:', {
        venueId: selectedVenue._id,
        venueName: selectedVenue.name,
        action: actionType,
        hasReason: !!rejectionReason
      });

      const response = await fetch(`/api/admin/venues/approval/${selectedVenue._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Failed to update venue';
        try {
          const errorText = await response.text();
          console.log('❌ Error response:', errorText);
          if (errorText) {
            try {
              const error = JSON.parse(errorText);
              errorMessage = error.error || error.message || errorMessage;
            } catch (parseError) {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (textError) {
          console.log('❌ Could not read error text:', textError);
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json()
      console.log('✅ Approval successful:', result);
      
      toast({
        title: "Success",
        description: result.message || `Venue ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`,
      })

      // Refresh the venues list
      await fetchVenues()
      
      // Close dialog
      setIsActionDialogOpen(false)
      setSelectedVenue(null)
      setActionType(null)
      setRejectionReason("")
      
    } catch (error: any) {
      console.error('Error updating venue:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleView = (venue: PendingVenue) => {
    setSelectedVenue(venue)
    setIsViewDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading venues...</p>
        </div>
      </div>
    )
  }

  // Admin access guard
  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="bg-red-100 p-4 rounded-lg">
            <X className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h2 className="text-xl font-semibold text-red-800">Access Denied</h2>
            <p className="text-red-600">You must be an admin to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Venue Approval</h1>
          <p className="text-muted-foreground">Review and approve venue registrations</p>
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
          <Button variant="outline" onClick={fetchVenues}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Venues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Venues
          </CardTitle>
        </CardHeader>
        <CardContent>
          {venues.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No {selectedStatus} venues found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Sports</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.map((venue) => (
                  <TableRow key={venue._id}>
                    <TableCell className="font-medium">{venue.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">{venue.owner?.name || 'Unknown Owner'}</p>
                          <p className="text-xs text-gray-500">{venue.owner?.email || 'No email'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{venue.shortLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {venue.sports.slice(0, 2).map((sport) => (
                          <Badge key={sport} variant="secondary" className="text-xs">
                            {sport}
                          </Badge>
                        ))}
                        {venue.sports.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{venue.sports.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₹{venue.startingPrice}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(venue.approvalStatus)}>
                        {venue.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDate(venue.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(venue)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {venue.approvalStatus === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(venue, 'approve')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(venue, 'reject')}
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

      {/* View Venue Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {selectedVenue?.name}
            </DialogTitle>
            <DialogDescription>
              Review venue details and information
            </DialogDescription>
          </DialogHeader>
          
          {selectedVenue && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Owner</Label>
                  <p className="text-sm text-gray-600">{selectedVenue.owner?.name || 'Unknown Owner'}</p>
                  <p className="text-xs text-gray-500">{selectedVenue.owner?.email || 'No email'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact</Label>
                  <p className="text-sm text-gray-600">{selectedVenue.contactPhone || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{selectedVenue.contactEmail || 'N/A'}</p>
                </div>
              </div>

              {/* Location */}
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-gray-600">{selectedVenue.shortLocation}</p>
                {selectedVenue.fullAddress && (
                  <p className="text-xs text-gray-500">{selectedVenue.fullAddress}</p>
                )}
              </div>

              {/* Description */}
              {selectedVenue.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600">{selectedVenue.description}</p>
                </div>
              )}

              {/* Sports */}
              <div>
                <Label className="text-sm font-medium">Sports Available</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedVenue.sports.map((sport) => (
                    <Badge key={sport} variant="secondary">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {selectedVenue.amenities && selectedVenue.amenities.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Amenities</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedVenue.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing & Rating */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Starting Price</Label>
                  <p className="text-sm text-gray-600">₹{selectedVenue.startingPrice}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Rating</Label>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600">{selectedVenue.rating || 0}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reviews</Label>
                  <p className="text-sm text-gray-600">{selectedVenue.reviewCount || 0}</p>
                </div>
              </div>

              {/* Status Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedVenue.approvalStatus)}>
                    {selectedVenue.approvalStatus}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-gray-600">{formatDate(selectedVenue.createdAt)}</p>
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedVenue.rejectionReason && (
                <div>
                  <Label className="text-sm font-medium text-red-600">Rejection Reason</Label>
                  <p className="text-sm text-red-600">{selectedVenue.rejectionReason}</p>
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
              {actionType === 'approve' ? 'Approve Venue' : 'Reject Venue'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? `Are you sure you want to approve "${selectedVenue?.name}"? This venue will become visible to users.`
                : `Are you sure you want to reject "${selectedVenue?.name}"? Please provide a reason for rejection.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {actionType === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please explain why this venue is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActionDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={processing || (actionType === 'reject' && !rejectionReason.trim())}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {processing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : actionType === 'approve' ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
