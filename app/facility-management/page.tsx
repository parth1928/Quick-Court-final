"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Upload, X } from "lucide-react"

const sportsOptions = [
  "Basketball",
  "Tennis",
  "Volleyball",
  "Badminton",
  "Football",
  "Table Tennis",
  "Squash",
  "Swimming",
]

const amenitiesOptions = [
  "Parking",
  "Locker Rooms",
  "Cafeteria",
  "Pro Shop",
  "Air Conditioning",
  "WiFi",
  "Shower Facilities",
  "Equipment Rental",
  "First Aid",
  "Security",
]

export default function FacilityManagementPage() {
  const [userData, setUserData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    sports: [] as string[],
    amenities: [] as string[],
  })
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
  if (parsedUser.role !== "owner") {
      router.push("/login")
      return
    }

    setUserData(parsedUser)
  }, [router])

  const handleSportToggle = (sport: string) => {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.includes(sport) ? prev.sports.filter((s) => s !== sport) : [...prev.sports, sport],
    }))
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handlePhotoUpload = () => {
    // Simulate photo upload
    const newPhoto = `/placeholder.svg?height=200&width=300&text=Facility+Photo+${uploadedPhotos.length + 1}`
    setUploadedPhotos((prev) => [...prev, newPhoto])
  }

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/owner/facilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          photos: uploadedPhotos,
          location: formData.location,
          isActive: true
        })
      });

      const data = await response.json();
      if (response.ok) {
        // Reset form
        setFormData({
          name: "",
          location: "",
          description: "",
          sports: [],
          amenities: []
        });
        setUploadedPhotos([]);
        router.push("/facility-dashboard");
      } else {
        console.error("Error creating facility:", data.error);
      }
    } catch (error) {
      console.error("Error creating facility:", error);
    }
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
        <p className="text-gray-600 mt-2">Add or edit your facility details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Facility Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter facility name"
                  className="border-gray-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-700">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter facility location"
                  className="border-gray-300"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your facility..."
                className="border-gray-300 min-h-[100px]"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Sports Supported */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Type of Sports Supported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sportsOptions.map((sport) => (
                <div key={sport} className="flex items-center space-x-2">
                  <Checkbox
                    id={sport}
                    checked={formData.sports.includes(sport)}
                    onCheckedChange={() => handleSportToggle(sport)}
                  />
                  <Label htmlFor={sport} className="text-sm text-gray-700">
                    {sport}
                  </Label>
                </div>
              ))}
            </div>
            {formData.sports.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected Sports:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.sports.map((sport) => (
                    <Badge key={sport} variant="outline" className="border-gray-300 text-gray-700">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Amenities Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenitiesOptions.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                  />
                  <Label htmlFor={amenity} className="text-sm text-gray-700">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
            {formData.amenities.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="bg-gray-100 text-gray-700">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Upload Multiple Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePhotoUpload}
                className="border-gray-300 text-gray-700 bg-transparent"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>

              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Facility photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
            Cancel
          </Button>
          <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
            Save Facility
          </Button>
        </div>
      </form>
    </div>
  )
}
