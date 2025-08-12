"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";

const sportsList = [
  "Cricket",
  "Football",
  "Basketball",
  "Tennis",
  "Badminton",
  "Table Tennis",
  "Volleyball",
  "Swimming",
  "Squash",
  "Boxing"
];

interface CreateFacilityModalProps {
  onSuccess: () => void;
}

export function CreateFacilityModal({ onSuccess }: CreateFacilityModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    sports: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userStr = localStorage.getItem("user");
      let token = localStorage.getItem("token");
      
      if (!userStr) {
        alert("Please log in again");
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(userStr);
      
      // Try to get token from localStorage first, then from user object
      if (!token && user.token) {
        token = user.token;
      }
      
      if (!token) {
        alert("Authentication required. Please log in again.");
        setIsLoading(false);
        return;
      }
      
      const response = await fetch("/api/facilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        setOpen(false);
        setFormData({
          name: "",
          location: "",
          description: "",
          sports: [],
        });
      } else {
        console.error("Error creating facility:", data.error);
        // You can add toast notification here
      }
    } catch (error) {
      console.error("Error creating facility:", error);
      // You can add toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isLoading) {
        setOpen(newOpen);
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Facility
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Facility</DialogTitle>
            <DialogDescription>
              Add details about your sports facility. You can add more information later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Facility Name</Label>
              <Input
                id="name"
                placeholder="Enter facility name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter facility location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sports">Available Sports</Label>
              <MultiSelect
                options={sportsList}
                selected={formData.sports}
                onChange={(selected: string[]) => setFormData({ ...formData, sports: selected })}
                placeholder="Select sports..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter facility description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Facility"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
