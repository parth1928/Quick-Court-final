import dbConnect from '../lib/db/connect.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Venue from '../models/Venue.js';
import Court from '../models/Court.js';
import Booking from '../models/Booking.js';

async function seedBookings() {
  try {
    await dbConnect();
    
    console.log('🌱 Starting to seed booking data...');
    
    // Find existing users, venues, and courts
    const users = await User.find({ role: 'user' }).limit(5);
    const venues = await Venue.find({ status: 'approved' }).limit(3);
    const courts = await Court.find({ isActive: true }).limit(5);
    
    if (users.length === 0 || venues.length === 0 || courts.length === 0) {
      console.log('❌ Please seed users, venues, and courts first');
      return;
    }
    
    console.log(`Found ${users.length} users, ${venues.length} venues, ${courts.length} courts`);
    
    // Clear existing bookings
    await Booking.deleteMany({});
    console.log('🗑️ Cleared existing bookings');
    
    const sampleBookings = [];
    const now = new Date();
    
    // Generate bookings for each user
    for (let userIndex = 0; userIndex < users.length; userIndex++) {
      const user = users[userIndex];
      const bookingsPerUser = Math.floor(Math.random() * 5) + 3; // 3-7 bookings per user
      
      for (let i = 0; i < bookingsPerUser; i++) {
        const court = courts[Math.floor(Math.random() * courts.length)];
        const venue = venues.find(v => v._id.toString() === court.venue.toString()) || venues[0];
        
        // Generate random date (some past, some future)
        const daysOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
        const bookingDate = new Date(now);
        bookingDate.setDate(bookingDate.getDate() + daysOffset);
        
        // Set random time between 8 AM and 8 PM
        const hour = Math.floor(Math.random() * 12) + 8; // 8-19
        const startTime = new Date(bookingDate);
        startTime.setHours(hour, 0, 0, 0);
        
        // Duration: 1-3 hours
        const durationHours = Math.floor(Math.random() * 3) + 1;
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + durationHours);
        
        // Determine status based on date
        let status = 'confirmed';
        let paymentStatus = 'paid';
        if (bookingDate < now) {
          // Past bookings - mostly completed, some cancelled
          status = Math.random() > 0.2 ? 'completed' : 'cancelled';
          if (status === 'cancelled') {
            paymentStatus = Math.random() > 0.5 ? 'refunded' : 'paid';
          }
        } else {
          // Future bookings - confirmed or pending
          status = Math.random() > 0.1 ? 'confirmed' : 'pending';
          paymentStatus = status === 'confirmed' ? 'paid' : 'pending';
        }
        
        // Calculate pricing
        const basePrice = court.pricing?.hourlyRate || 500;
        const totalPrice = basePrice * durationHours;
        const tax = totalPrice * 0.18;
        const platformFee = totalPrice * 0.05;
        const finalPrice = totalPrice + tax + platformFee;
        
        // Random extras
        const hasNotes = Math.random() > 0.7;
        const hasReview = status === 'completed' && Math.random() > 0.4;
        const cancellationReason = status === 'cancelled' ? 
          ['User cancelled', 'Weather conditions', 'Emergency', 'Schedule conflict'][Math.floor(Math.random() * 4)] : null;
        
        const booking = {
          user: user._id,
          court: court._id,
          venue: venue._id,
          startTime,
          endTime,
          status,
          totalPrice: Math.round(finalPrice),
          pricingBreakdown: {
            baseRate: Math.round(totalPrice),
            tax: Math.round(tax),
            platformFee: Math.round(platformFee),
            currency: 'INR'
          },
          paymentStatus,
          paymentId: paymentStatus === 'paid' ? `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
          notes: hasNotes ? [
            'Please keep the court clean',
            'Bringing own equipment',
            'First time at this venue',
            'Regular booking',
            'Team practice session'
          ][Math.floor(Math.random() * 5)] : null,
          cancellationReason,
          refundAmount: status === 'cancelled' && paymentStatus === 'refunded' ? 
            Math.round(finalPrice * 0.8) : 0, // 80% refund
          checkInAt: status === 'completed' ? 
            new Date(startTime.getTime() - Math.random() * 30 * 60 * 1000) : null, // Check-in within 30 mins before
          checkOutAt: status === 'completed' ? 
            new Date(endTime.getTime() + Math.random() * 15 * 60 * 1000) : null, // Check-out within 15 mins after
          review: hasReview ? {
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            comment: [
              'Great facilities and well maintained!',
              'Excellent court surface and lighting',
              'Very clean and professional venue',
              'Good value for money',
              'Will definitely book again',
              'Staff was helpful and friendly',
              'Perfect for our team practice'
            ][Math.floor(Math.random() * 7)],
            reviewedAt: new Date(endTime.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) // Within a week after
          } : undefined,
          createdAt: new Date(startTime.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Booked up to 2 weeks before
          updatedAt: new Date()
        };
        
        sampleBookings.push(booking);
      }
    }
    
    // Insert all bookings
    console.log(`📝 Creating ${sampleBookings.length} sample bookings...`);
    const createdBookings = await Booking.insertMany(sampleBookings);
    
    // Update user booking counts
    for (const user of users) {
      const confirmedBookings = await Booking.countDocuments({
        user: user._id,
        status: { $in: ['confirmed', 'completed'] }
      });
      
      await User.updateOne(
        { _id: user._id },
        { bookingCount: confirmedBookings }
      );
    }
    
    console.log(`✅ Successfully created ${createdBookings.length} bookings`);
    
    // Display summary
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    console.log('\n📊 Booking Statistics:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} bookings, ₹${stat.totalRevenue.toLocaleString('en-IN')} revenue`);
    });
    
    // Show sample data for verification
    const sampleBooking = await Booking.findOne()
      .populate('user', 'name email')
      .populate('court', 'name sportType')
      .populate('venue', 'name shortLocation');
    
    if (sampleBooking) {
      console.log('\n🔍 Sample Booking:');
      console.log(`  User: ${sampleBooking.user.name} (${sampleBooking.user.email})`);
      console.log(`  Venue: ${sampleBooking.venue.name} - ${sampleBooking.court.name}`);
      console.log(`  Date: ${sampleBooking.startTime.toLocaleDateString()} ${sampleBooking.startTime.toLocaleTimeString()}`);
      console.log(`  Status: ${sampleBooking.status}`);
      console.log(`  Price: ₹${sampleBooking.totalPrice.toLocaleString('en-IN')}`);
    }
    
    console.log('\n🎉 Booking data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding booking data:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the seeding function
seedBookings();
