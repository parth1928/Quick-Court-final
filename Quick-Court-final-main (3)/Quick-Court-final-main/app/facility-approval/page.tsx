"use client"

import { useState } from "react"
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
import { MapPin, Calendar, Eye, Check, X } from "lucide-react"

interface PendingFacility {
  id: string
  facilityName: string
  ownerName: string
  location: string
  dateSubmitted: string
  status: "pending" | "approved" | "rejected"
  description: string
  address: string
  sports: string[]
  amenities: string[]
  photos: string[]
}

const pendingFacilities: PendingFacility[] = [
  {
    id: "1",
    facilityName: "Elite Sports Complex",
    ownerName: "John Smith",
    location: "Andheri, Mumbai",
    dateSubmitted: "2024-01-15",
    status: "pending",
    description: "A state-of-the-art sports facility with multiple courts and modern amenities.",
    address: "123 Sports Ave, Andheri, Mumbai 400053",
    sports: ["Basketball", "Tennis", "Volleyball"],
    amenities: ["Parking", "Locker Rooms", "Cafeteria", "Pro Shop"],
    photos: [
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
    ],
  },
  {
    id: "2",
    facilityName: "Community Recreation Center",
    ownerName: "Sarah Johnson",
    location: "Koramangala, Bengaluru",
    dateSubmitted: "2024-01-12",
    status: "pending",
    description: "Family-friendly recreation center serving the local community.",
    address: "456 Community St, Koramangala, Bengaluru 560034",
    sports: ["Basketball", "Badminton", "Table Tennis"],
    amenities: ["Parking", "Locker Rooms", "Kids Area"],
    photos: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
  },
  {
    id: "3",
    facilityName: "Premier Tennis Club",
    ownerName: "Mike Wilson",
    location: "CP, Delhi",
    dateSubmitted: "2024-01-10",
    status: "pending",
    description: "Exclusive tennis club with professional-grade courts.",
    address: "789 Tennis Blvd, CP, Delhi 110001",
    sports: ["Tennis"],
    amenities: ["Parking", "Locker Rooms", "Pro Shop", "Restaurant"],
    photos: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
  },
]

export default function FacilityApproval() {
  const [selectedFacility, setSelectedFacility] = useState<PendingFacility | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectComments, setRejectComments] = useState("")
  const [facilities, setFacilities] = useState(pendingFacilities)

  const handleApprove = (facilityId: string) => {
    setFacilities((prev) =>
      prev.map((facility) => (facility.id === facilityId ? { ...facility, status: "approved" as const } : facility)),
    )
  }

  const handleReject = (facilityId: string) => {
    setFacilities((prev) =>
      prev.map((facility) => (facility.id === facilityId ? { ...facility, status: "rejected" as const } : facility)),
    )
    setShowRejectModal(false)
    setRejectComments("")
  }

  const openDetailModal = (facility: PendingFacility) => {
    setSelectedFacility(facility)
    setShowDetailModal(true)
  }

  const openRejectModal = (facility: PendingFacility) => {
    setSelectedFacility(facility)
    setShowRejectModal(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facility Approval</h1>
        <p className="text-gray-600 mt-2">Review and approve pending facility registrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility Name</TableHead>
                <TableHead>Owner Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map((facility) => (
                <TableRow key={facility.id}>
                  <TableCell className="font-medium">{facility.facilityName}</TableCell>
                  <TableCell>{facility.ownerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {facility.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {facility.dateSubmitted}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        facility.status === "approved"
                          ? "default"
                          : facility.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {facility.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openDetailModal(facility)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {facility.status === "pending" && (
                        <>
                          <Button variant="default" size="sm" onClick={() => handleApprove(facility.id)}>
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openRejectModal(facility)}>
                            <X className="h-4 w-4 mr-1" />
                            Reject
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

      {/* Detail View Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFacility?.facilityName}</DialogTitle>
            <DialogDescription>Facility Registration Details</DialogDescription>
          </DialogHeader>

          {selectedFacility && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Owner Name</Label>
                  <p className="text-sm text-gray-600">{selectedFacility.ownerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date Submitted</Label>
                  <p className="text-sm text-gray-600">{selectedFacility.dateSubmitted}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedFacility.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Full Address</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedFacility.address}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Sports Supported</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedFacility.sports.map((sport) => (
                    <Badge key={sport} variant="outline">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Amenities</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedFacility.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Photo Gallery</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {selectedFacility.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo || "/placeholder.svg"}
                      alt={`Facility photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="admin-comments" className="text-sm font-medium">
                  Admin Comments
                </Label>
                <Textarea id="admin-comments" placeholder="Add your comments here..." className="mt-1" />
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedFacility?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetailModal(false)
                    openRejectModal(selectedFacility)
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(selectedFacility.id)
                    setShowDetailModal(false)
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Facility Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {selectedFacility?.facilityName}? You can add optional comments below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-comments" className="text-sm font-medium">
                Rejection Comments (Optional)
              </Label>
              <Textarea
                id="reject-comments"
                placeholder="Provide reasons for rejection..."
                value={rejectComments}
                onChange={(e) => setRejectComments(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => selectedFacility && handleReject(selectedFacility.id)}>
              <X className="h-4 w-4 mr-1" />
              Reject Facility
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
