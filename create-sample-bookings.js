import dbConnect from './lib/db/connect.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import Venue from './models/Venue.js';
import Court from './models/Court.js';
import Booking from './models/Booking.js';

async function createSampleBookings() {
  try {
    await dbConnect();
    console.log('🌱 Starting to create sample booking data...');
    
    // Find existing data
    const users = await User.find({ role: 'user' }).limit(3);
    const venues = await Venue.find({ approvalStatus: 'approved' }).limit(2);
    const courts = await Court.find({ isActive: true }).limit(3);
    
    console.log(`Found ${users.length} users, ${venues.length} venues, ${courts.length} courts`);
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create some users first.');
      return;
    }
    
    if (courts.length === 0) {
      console.log('❌ No courts found. Creating a sample court...');
      
      // Create a sample venue and court if none exist
      const sampleVenue = await Venue.create({
        name: 'Sample Sports Complex',
        owner: users[0]._id,
        shortLocation: 'Downtown',
        fullAddress: '123 Sports Street, City Center',
        description: 'A modern sports facility',
        sports: ['Basketball', 'Tennis'],
        amenities: ['Parking', 'Changing Rooms'],
        images: [],
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716] // Bangalore coordinates
        },
        approvalStatus: 'approved',
        status: 'approved'
      });
      
      const sampleCourt = await Court.create({
        venue: sampleVenue._id,
        name: 'Basketball Court 1',
        sportType: 'Basketball',
        description: 'Full-size basketball court',
        surfaceType: 'Wooden',
        indoor: true,
        capacity: 10,
        pricing: {
          hourlyRate: 500,
          currency: 'INR'
        },
        availability: {
          monday: { open: '06:00', close: '22:00' },
          tuesday: { open: '06:00', close: '22:00' },
          wednesday: { open: '06:00', close: '22:00' },
          thursday: { open: '06:00', close: '22:00' },
          friday: { open: '06:00', close: '22:00' },
          saturday: { open: '08:00', close: '20:00' },
          sunday: { open: '08:00', close: '20:00' }
        },
        isActive: true,
        status: 'active'
      });
      
      courts.push(sampleCourt);
      venues.push(sampleVenue);
      console.log('✅ Created sample venue and court');
    }
    
    // Clear existing bookings
    await Booking.deleteMany({});
    console.log('🗑️ Cleared existing bookings');
    
    const bookings = [];
    const now = new Date();
    
    // Create bookings for each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Create 3-5 bookings per user
      const bookingCount = Math.floor(Math.random() * 3) + 3;
      
      for (let j = 0; j < bookingCount; j++) {
        const court = courts[Math.floor(Math.random() * courts.length)];
        const venue = venues.find(v => v._id.toString() === court.venue.toString()) || venues[0];
        
        // Generate dates: some past, some future
        const daysOffset = Math.floor(Math.random() * 30) - 15; // -15 to +15 days
        const bookingDate = new Date(now);
        bookingDate.setDate(bookingDate.getDate() + daysOffset);
        
        // Random time between 9 AM and 7 PM
        const hour = Math.floor(Math.random() * 10) + 9;
        const startTime = new Date(bookingDate);
        startTime.setHours(hour, 0, 0, 0);
        
        // Duration: 1-2 hours
        const duration = Math.floor(Math.random() * 2) + 1;
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + duration);
        
        // Status based on date
        let status = 'confirmed';
        let paymentStatus = 'paid';
        
        if (bookingDate < now) {
          status = Math.random() > 0.8 ? 'cancelled' : 'completed';
          if (status === 'cancelled') {
            paymentStatus = 'refunded';
          }
        } else {
          status = Math.random() > 0.9 ? 'pending' : 'confirmed';
        }
        
        // Calculate price
        const hourlyRate = court.pricing?.hourlyRate || 500;
        const basePrice = hourlyRate * duration;
        const tax = basePrice * 0.18;
        const total = basePrice + tax;
        
        const booking = {
          user: user._id,
          court: court._id,
          venue: venue._id,
          startTime,
          endTime,
          status,
          totalPrice: Math.round(total),
          pricingBreakdown: {
            baseRate: basePrice,
            tax: Math.round(tax),
            discount: 0,
            currency: 'INR'
          },
          paymentStatus,
          paymentId: paymentStatus === 'paid' ? `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
          notes: Math.random() > 0.7 ? 'Great facility!' : null,
          createdAt: new Date(startTime.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        };
        
        bookings.push(booking);
      }
    }
    
    // Insert bookings
    const createdBookings = await Booking.insertMany(bookings);
    console.log(`✅ Created ${createdBookings.length} sample bookings`);
    
    // Update user booking counts
    for (const user of users) {
      const count = await Booking.countDocuments({
        user: user._id,
        status: { $in: ['confirmed', 'completed'] }
      });
      await User.updateOne({ _id: user._id }, { bookingCount: count });
    }
    
    // Show summary
    const summary = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    console.log('\n📊 Booking Summary:');
    summary.forEach(s => {
      console.log(`  ${s._id}: ${s.count} bookings, ₹${s.total.toLocaleString('en-IN')}`);
    });
    
    console.log('\n🎉 Sample bookings created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample bookings:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createSampleBookings();
