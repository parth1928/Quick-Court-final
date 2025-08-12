"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { Plus } from "lucide-react";

const sportsList = ["Cricket","Football","Basketball","Tennis","Badminton","Table Tennis","Volleyball","Swimming","Squash","Boxing"];
const amenitiesList = ["Parking","Locker Rooms","Showers","Cafeteria","First Aid","Lights","Seating","Drinking Water","Washrooms","Pro Shop"];

interface CreateVenueModalProps { onSuccess?: () => void }

export function CreateVenueModal({ onSuccess }: CreateVenueModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sports, setSports] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string>(""); // comma separated for quick input
  const [form, setForm] = useState({
    name: "",
    shortLocation: "",
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    contactPhone: "",
    contactEmail: "",
    mapLink: "",
    latitude: "",
    longitude: "",
    description: "",
    startingPrice: "",
    pricePerHour: "",
    monOpen: "06:00", monClose: "22:00"
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      // Generate a unique slug by combining name with timestamp
      const timestamp = new Date().getTime();
      const baseSlug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const uniqueSlug = `${baseSlug}-${timestamp}`;

      // Normalization helpers
      const allowedSports = ['badminton','tennis','basketball','cricket','football','volleyball','table-tennis','squash','swimming'];
      const normalizeSport = (s: string) => {
        const base = s.toLowerCase().trim();
        if (base === 'table tennis' || base === 'table-tennis') return 'table-tennis';
        return base.replace(/\s+/g,'-');
      };
      const normalizedSports = sports.map(normalizeSport).filter(s=>allowedSports.includes(s));
      if (!normalizedSports.length) {
        throw new Error('Select at least one valid sport');
      }
      const amenityMap: Record<string,string> = {
        'Parking':'parking','Locker Rooms':'lockers','Showers':'showers','Cafeteria':'cafeteria','First Aid':'first-aid','Lights':'lights','Seating':'', 'Drinking Water':'', 'Washrooms':'', 'Pro Shop':'pro-shop', 'WiFi':'wifi','Equipment Rental':'equipment-rental','Air Conditioning':'ac'
      };
      const normalizedAmenities = amenities
        .map(a=>amenityMap[a]||a.toLowerCase().replace(/\s+/g,'-'))
        .filter(a=>['lights','parking','showers','lockers','cafeteria','first-aid','ac','wifi','equipment-rental','pro-shop'].includes(a));

      const latNum = Number(form.latitude);
      const lngNum = Number(form.longitude);
      const priceNum = Number(form.pricePerHour || form.startingPrice);
      if (!priceNum || priceNum <=0) {
        throw new Error('Price per hour must be greater than 0');
      }
      if (!form.city || !form.state || !form.pincode) {
        throw new Error('City, State and Pincode are required');
      }
      if (!/^\d{6}$/.test(form.pincode)) {
        throw new Error('Pincode must be 6 digits');
      }

      const payload: any = {
        name: form.name,
        description: form.description,
        shortLocation: form.shortLocation || form.city,
        fullAddress: form.fullAddress,
        contactPhone: form.contactPhone || form.contactEmail,
        contactEmail: form.contactEmail,
        mapLink: form.mapLink,
        sports: normalizedSports, // legacy compatibility
        sportsOffered: normalizedSports,
        amenities: normalizedAmenities,
        images: images.split(',').map(s=>s.trim()).filter(Boolean),
        photos: images.split(',').map(s=>s.trim()).filter(Boolean),
        startingPrice: priceNum,
        pricePerHour: priceNum,
        address: { 
          street: form.fullAddress || form.name,
          city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: form.country || 'India'
        },
        geoLocation: { lat: isNaN(latNum)?0:latNum, lng: isNaN(lngNum)?0:lngNum },
        operatingHours: { open: form.monOpen, close: form.monClose },
        approvalStatus: 'pending',
        status: 'pending',
        slug: uniqueSlug
      };

      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (!res.ok) {
        let errorMessage = 'Failed to create venue';
        if (data.error === 'Validation failed' && Array.isArray(data.details)) {
          errorMessage = data.details.join('\n');
        } else if (data.error === 'Duplicate key error') {
          errorMessage = 'A venue with similar identifier already exists';
        } else if (data.error) {
          errorMessage = data.error;
        }
        throw new Error(errorMessage);
      }
      
      console.log('Venue created successfully', data._id || data.id);
      console.log('Full venue data:', data);
      if (onSuccess) onSuccess();
      setOpen(false);
      setSports([]); setAmenities([]); setImages("");
  setForm({ name:"", shortLocation:"", fullAddress:"", city:"", state:"", pincode:"", country:"India", contactPhone:"", contactEmail:"", mapLink:"", latitude:"", longitude:"", description:"", startingPrice:"", pricePerHour:"", monOpen:"06:00", monClose:"22:00" });
    } catch (err:any) {
      console.error("Create venue error", err);
      alert(err.message);
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={o=>!loading&&setOpen(o)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-gray-300 text-gray-700"><Plus className="h-4 w-4 mr-2"/>Add Venue</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[640px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Create Venue</DialogTitle>
            <DialogDescription>Provide key details now; you can edit later.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={e=>update('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Input value={form.city} onChange={e=>update('city', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <Input value={form.state} onChange={e=>update('state', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Pincode *</Label>
              <Input value={form.pincode} onChange={e=>update('pincode', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Price / Hour (₹)</Label>
              <Input type="number" value={form.pricePerHour} onChange={e=>update('pricePerHour', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Short Location</Label>
              <Input value={form.shortLocation} onChange={e=>update('shortLocation', e.target.value)} placeholder="Area, City" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Full Address</Label>
              <Textarea value={form.fullAddress} onChange={e=>update('fullAddress', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input value={form.contactPhone} onChange={e=>update('contactPhone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" value={form.contactEmail} onChange={e=>update('contactEmail', e.target.value)} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Map Link</Label>
              <Input value={form.mapLink} onChange={e=>update('mapLink', e.target.value)} placeholder="https://maps.google.com/?q=..." />
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input value={form.latitude} onChange={e=>update('latitude', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input value={form.longitude} onChange={e=>update('longitude', e.target.value)} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Images (comma separated URLs)</Label>
              <Textarea value={images} onChange={e=>setImages(e.target.value)} placeholder="https://.../a.jpg, https://.../b.jpg" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e=>update('description', e.target.value)} required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Sports</Label>
              <MultiSelect options={sportsList} selected={sports} onChange={setSports} placeholder="Select sports" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Amenities</Label>
              <MultiSelect options={amenitiesList} selected={amenities} onChange={setAmenities} placeholder="Select amenities" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={()=>setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading? 'Creating...':'Create Venue'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
