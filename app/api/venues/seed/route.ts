import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Venue from '@/models/Venue';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Seed some sample venues for testing
export async function POST() {
  try {
    await dbConnect();
    
    // First, create a test owner user if not exists
    let owner = await User.findOne({ email: 'owner@test.com' });
    if (!owner) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      owner = await User.create({
        name: 'Test Owner',
        email: 'owner@test.com',
        password: hashedPassword,
        role: 'owner',
        phone: '+91 9876543210'
      });
    }

    // Sample venues data
    const sampleVenues = [
      {
        name: "Elite Sports Complex",
        owner: owner._id,
        shortLocation: "Andheri, Mumbai",
        fullAddress: "123 Main Road, Andheri West, Mumbai, Maharashtra 400053",
        address: {
          street: "123 Main Road",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400053",
          country: "India"
        },
        contactNumber: "+91 98765 43210",
        contactPhone: "+91 98765 43210",
        contactEmail: "elite@sports.com",
        description: "Premium sports facility with multiple courts and professional coaching",
        sportsOffered: ["basketball", "tennis", "volleyball"],
        sports: ["basketball", "tennis", "volleyball"],
        pricePerHour: 500,
        startingPrice: 500,
        rating: 4.8,
        totalReviews: 124,
        reviewCount: 124,
        images: ["/placeholder.jpg"],
        photos: ["/placeholder.jpg"],
        amenities: ["Parking", "Locker Rooms", "Cafeteria", "WiFi"],
        approvalStatus: "approved",
        status: "approved",
        openingHours: {
          monday: { open: "06:00", close: "22:00" },
          tuesday: { open: "06:00", close: "22:00" },
          wednesday: { open: "06:00", close: "22:00" },
          thursday: { open: "06:00", close: "22:00" },
          friday: { open: "06:00", close: "22:00" },
          saturday: { open: "06:00", close: "23:00" },
          sunday: { open: "07:00", close: "21:00" }
        },
        defaultAvailableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]
      },
      {
        name: "Urban Basketball Arena",
        owner: owner._id,
        shortLocation: "Bandra, Mumbai",
        fullAddress: "456 Sports Street, Bandra East, Mumbai, Maharashtra 400051",
        address: {
          street: "456 Sports Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400051",
          country: "India"
        },
        contactNumber: "+91 98765 43211",
        contactPhone: "+91 98765 43211",
        contactEmail: "urban@basketball.com",
        description: "Professional basketball courts with modern amenities",
        sportsOffered: ["basketball"],
        sports: ["basketball"],
        pricePerHour: 400,
        startingPrice: 400,
        rating: 4.7,
        totalReviews: 78,
        reviewCount: 78,
        images: ["/placeholder.jpg"],
        photos: ["/placeholder.jpg"],
        amenities: ["Parking", "Locker Rooms", "Snack Bar"],
        approvalStatus: "approved",
        status: "approved",
        openingHours: {
          monday: { open: "07:00", close: "22:00" },
          tuesday: { open: "07:00", close: "22:00" },
          wednesday: { open: "07:00", close: "22:00" },
          thursday: { open: "07:00", close: "22:00" },
          friday: { open: "07:00", close: "22:00" },
          saturday: { open: "07:00", close: "23:00" },
          sunday: { open: "08:00", close: "21:00" }
        },
        defaultAvailableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]
      },
      {
        name: "Premier Tennis Club",
        owner: owner._id,
        shortLocation: "CP, Delhi",
        fullAddress: "789 Connaught Place, New Delhi, Delhi 110001",
        address: {
          street: "789 Connaught Place",
          city: "New Delhi",
          state: "Delhi",
          zipCode: "110001",
          country: "India"
        },
        contactNumber: "+91 99887 77665",
        contactPhone: "+91 99887 77665",
        contactEmail: "premier@tennis.com",
        description: "Exclusive tennis club with professional courts and coaching",
        sportsOffered: ["tennis"],
        sports: ["tennis"],
        pricePerHour: 800,
        startingPrice: 800,
        rating: 4.9,
        totalReviews: 156,
        reviewCount: 156,
        images: ["/placeholder.jpg"],
        photos: ["/placeholder.jpg"],
        amenities: ["Parking", "Pro Shop", "Restaurant", "WiFi"],
        approvalStatus: "approved",
        status: "approved",
        openingHours: {
          monday: { open: "06:00", close: "21:00" },
          tuesday: { open: "06:00", close: "21:00" },
          wednesday: { open: "06:00", close: "21:00" },
          thursday: { open: "06:00", close: "21:00" },
          friday: { open: "06:00", close: "21:00" },
          saturday: { open: "06:00", close: "22:00" },
          sunday: { open: "07:00", close: "20:00" }
        },
        defaultAvailableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]
      },
      {
        name: "Community Recreation Center",
        owner: owner._id,
        shortLocation: "Koramangala, Bengaluru",
        fullAddress: "321 Community Street, Koramangala, Bengaluru, Karnataka 560034",
        address: {
          street: "321 Community Street",
          city: "Bengaluru",
          state: "Karnataka",
          zipCode: "560034",
          country: "India"
        },
        contactNumber: "+91 88888 44444",
        contactPhone: "+91 88888 44444",
        contactEmail: "community@rec.com",
        description: "Community-friendly sports center with affordable rates",
        sportsOffered: ["volleyball", "badminton", "table-tennis"],
        sports: ["volleyball", "badminton", "table-tennis"],
        pricePerHour: 300,
        startingPrice: 300,
        rating: 4.6,
        totalReviews: 89,
        reviewCount: 89,
        images: ["/placeholder.jpg"],
        photos: ["/placeholder.jpg"],
        amenities: ["Parking", "Locker Rooms"],
        approvalStatus: "approved",
        status: "approved",
        openingHours: {
          monday: { open: "07:00", close: "22:00" },
          tuesday: { open: "07:00", close: "22:00" },
          wednesday: { open: "07:00", close: "22:00" },
          thursday: { open: "07:00", close: "22:00" },
          friday: { open: "07:00", close: "22:00" },
          saturday: { open: "07:00", close: "23:00" },
          sunday: { open: "08:00", close: "21:00" }
        },
        defaultAvailableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]
      },
      {
        name: "Fitness & Sports Hub",
        owner: owner._id,
        shortLocation: "Hitech City, Hyderabad",
        fullAddress: "202 Tech Park, Hitech City, Hyderabad, Telangana 500081",
        address: {
          street: "202 Tech Park",
          city: "Hyderabad",
          state: "Telangana",
          zipCode: "500081",
          country: "India"
        },
        contactNumber: "+91 88888 55555",
        contactPhone: "+91 88888 55555",
        contactEmail: "fitness@sports.com",
        description: "Modern fitness and sports facility with latest equipment",
        sportsOffered: ["basketball", "volleyball", "badminton"],
        sports: ["basketball", "volleyball", "badminton"],
        pricePerHour: 350,
        startingPrice: 350,
        rating: 4.5,
        totalReviews: 92,
        reviewCount: 92,
        images: ["/placeholder.jpg"],
        photos: ["/placeholder.jpg"],
        amenities: ["Parking", "Gym", "Locker Rooms", "WiFi"],
        approvalStatus: "approved",
        status: "approved",
        openingHours: {
          monday: { open: "06:00", close: "23:00" },
          tuesday: { open: "06:00", close: "23:00" },
          wednesday: { open: "06:00", close: "23:00" },
          thursday: { open: "06:00", close: "23:00" },
          friday: { open: "06:00", close: "23:00" },
          saturday: { open: "06:00", close: "24:00" },
          sunday: { open: "07:00", close: "22:00" }
        },
        defaultAvailableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"]
      }
    ];

    // Clear existing venues and create new ones
    await Venue.deleteMany({});
    const createdVenues = await Venue.insertMany(sampleVenues);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdVenues.length} venues`,
      venues: createdVenues.length,
      owner: owner.email
    });

  } catch (error) {
    console.error('Error seeding venues:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to seed venues'
    }, { status: 500 });
  }
}

// GET method to check current venues
export async function GET() {
  try {
    await dbConnect();
    
    const venueCount = await Venue.countDocuments();
    const approvedVenues = await Venue.countDocuments({ approvalStatus: 'approved' });
    
    return NextResponse.json({
      success: true,
      totalVenues: venueCount,
      approvedVenues: approvedVenues,
      message: `Database has ${venueCount} venues, ${approvedVenues} approved`
    });
    
  } catch (error) {
    console.error('Error checking venues:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check venues'
    }, { status: 500 });
  }
}
