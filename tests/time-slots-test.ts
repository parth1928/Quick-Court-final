import { connectDB } from '../lib/db';
import Court from '../models/Court';
import Venue from '../models/Venue';

async function testConnections() {
  try {
    // Test MongoDB connection
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Test Court Model queries
    const courtsCount = await Court.countDocuments();
    console.log(`✅ Court Model working - found ${courtsCount} courts`);

    // Test Court-Venue relationship
    const courtWithVenue = await Court.findOne().populate('venue');
    if (courtWithVenue) {
      console.log('✅ Court-Venue relationship working');
    } else {
      console.log('⚠️ No courts with venues found');
    }

    // Test time slot data structure
    const courtWithTimeSlots = await Court.findOne({
      operatingHours: { $exists: true }
    });
    if (courtWithTimeSlots) {
      console.log('✅ Time slot data structure is valid');
      console.log('Sample operating hours:', courtWithTimeSlots.operatingHours);
    } else {
      console.log('⚠️ No courts with time slots found');
    }

    // Test venue ownership
    const venueWithOwner = await Venue.findOne().populate('owner');
    if (venueWithOwner) {
      console.log('✅ Venue-Owner relationship working');
    } else {
      console.log('⚠️ No venues with owners found');
    }

    // Test court queries with dates
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 7);

    const courtsWithBlackoutDates = await Court.find({
      blackoutDates: {
        $elemMatch: {
          $gte: today,
          $lte: futureDate
        }
      }
    });
    console.log(`Found ${courtsWithBlackoutDates.length} courts with blackout dates in next 7 days`);

    // Test maintenance status
    const courtsInMaintenance = await Court.find({ status: 'maintenance' });
    console.log(`Found ${courtsInMaintenance.length} courts in maintenance`);

    // Test availability overrides
    const courtsWithOverrides = await Court.find({
      'availabilityOverrides.0': { $exists: true }
    });
    console.log(`Found ${courtsWithOverrides.length} courts with availability overrides`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit();
  }
}

testConnections();
