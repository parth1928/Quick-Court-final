const mongoose = require('mongoose');

// Connect to MongoDB
const dbConnect = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Import models
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: String,
  password: String,
  phone: String,
  createdAt: { type: Date, default: Date.now },
}, { collection: 'users' });

const FacilitySchema = new mongoose.Schema({
  name: String,
  shortLocation: String,
  fullAddress: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'active' },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'venues' });

const CourtSchema = new mongoose.Schema({
  name: String,
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  sportType: String,
  surfaceType: String,
  status: { type: String, default: 'active' },
  deletedAt: { type: Date, default: null },
  pricing: {
    basePrice: { type: Number, default: 100 },
    currency: { type: String, default: 'INR' }
  },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'courts' });

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court' },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  startTime: Date,
  endTime: Date,
  status: { type: String, default: 'confirmed' },
  totalPrice: Number,
  paymentStatus: { type: String, default: 'paid' },
  paymentId: String,
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'bookings' });

const User = mongoose.model('User', UserSchema);
const Facility = mongoose.model('Venue', FacilitySchema);
const Court = mongoose.model('Court', CourtSchema);
const Booking = mongoose.model('Booking', BookingSchema);

async function setupOwnerTestData() {
  try {
    await dbConnect();

    console.log('🔍 Looking for facility owners...');
    
    // Find owners
    const owners = await User.find({ role: 'owner' }).limit(5);
    console.log(`👥 Found ${owners.length} facility owners`);

    if (owners.length === 0) {
      console.log('❌ No owners found! Creating a test owner...');
      
      const testOwner = new User({
        firstName: 'Test',
        lastName: 'Owner',
        email: 'owner@test.com',
        role: 'owner',
        password: '$2b$10$hashedpassword', // placeholder
        phone: '+91-9876543210'
      });
      
      await testOwner.save();
      owners.push(testOwner);
      console.log('✅ Created test owner:', testOwner.email);
    }

    // For each owner, ensure they have facilities, courts, and bookings
    for (const owner of owners) {
      console.log(`\n🏢 Setting up data for owner: ${owner.email} (${owner._id})`);
      
      // Check existing facilities
      let facilities = await Facility.find({ owner: owner._id, deletedAt: null });
      console.log(`   📊 Existing facilities: ${facilities.length}`);
      
      // Create facilities if none exist
      if (facilities.length === 0) {
        console.log('   🏗️ Creating test facilities...');
        
        const testFacilities = [
          {
            name: `${owner.firstName}'s Sports Complex`,
            shortLocation: 'Mumbai Central',
            fullAddress: '123 Sports Street, Mumbai Central, Mumbai 400008',
            owner: owner._id,
            status: 'active'
          },
          {
            name: `${owner.firstName}'s Arena`,
            shortLocation: 'Bandra West',
            fullAddress: '456 Court Avenue, Bandra West, Mumbai 400050',
            owner: owner._id,
            status: 'active'
          }
        ];
        
        for (const facilityData of testFacilities) {
          const facility = new Facility(facilityData);
          await facility.save();
          facilities.push(facility);
          console.log(`   ✅ Created facility: ${facility.name}`);
        }
      }

      // For each facility, create courts if they don't exist
      for (const facility of facilities) {
        let courts = await Court.find({ venue: facility._id, deletedAt: null });
        console.log(`   📊 Existing courts for ${facility.name}: ${courts.length}`);
        
        if (courts.length === 0) {
          console.log(`   🏟️ Creating courts for ${facility.name}...`);
          
          const testCourts = [
            {
              name: 'Basketball Court A',
              venue: facility._id,
              sportType: 'basketball',
              surfaceType: 'wooden',
              pricing: { basePrice: 150, currency: 'INR' }
            },
            {
              name: 'Tennis Court 1',
              venue: facility._id,
              sportType: 'tennis',
              surfaceType: 'clay',
              pricing: { basePrice: 200, currency: 'INR' }
            },
            {
              name: 'Badminton Court 1',
              venue: facility._id,
              sportType: 'badminton',
              surfaceType: 'synthetic',
              pricing: { basePrice: 120, currency: 'INR' }
            }
          ];
          
          for (const courtData of testCourts) {
            const court = new Court(courtData);
            await court.save();
            courts.push(court);
            console.log(`     ✅ Created court: ${court.name}`);
          }
        }

        // Create test bookings for courts
        for (const court of courts) {
          const existingBookings = await Booking.find({ court: court._id, deletedAt: null });
          console.log(`   📊 Existing bookings for ${court.name}: ${existingBookings.length}`);
          
          if (existingBookings.length === 0) {
            console.log(`   📅 Creating test bookings for ${court.name}...`);
            
            // Find some regular users for bookings
            const users = await User.find({ role: 'user' }).limit(3);
            
            if (users.length > 0) {
              const now = new Date();
              const testBookings = [
                {
                  user: users[0]._id,
                  court: court._id,
                  venue: facility._id,
                  startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
                  endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
                  status: 'confirmed',
                  totalPrice: court.pricing.basePrice,
                  paymentStatus: 'paid',
                  paymentId: 'test_payment_' + Date.now()
                },
                {
                  user: users[1] ? users[1]._id : users[0]._id,
                  court: court._id,
                  venue: facility._id,
                  startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
                  endTime: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
                  status: 'completed',
                  totalPrice: court.pricing.basePrice,
                  paymentStatus: 'paid',
                  paymentId: 'test_payment_' + (Date.now() - 1)
                }
              ];
              
              for (const bookingData of testBookings) {
                const booking = new Booking(bookingData);
                await booking.save();
                console.log(`     ✅ Created booking: ${booking.status} (${booking.totalPrice} INR)`);
              }
            } else {
              console.log('     ⚠️ No users found to create bookings');
            }
          }
        }
      }
    }

    console.log('\n🎉 Test data setup complete!');
    console.log('📊 Summary:');
    
    const totalFacilities = await Facility.countDocuments({ deletedAt: null });
    const totalCourts = await Court.countDocuments({ deletedAt: null });
    const totalBookings = await Booking.countDocuments({ deletedAt: null });
    
    console.log(`   🏢 Total Facilities: ${totalFacilities}`);
    console.log(`   🏟️ Total Courts: ${totalCourts}`);
    console.log(`   📅 Total Bookings: ${totalBookings}`);
    
  } catch (error) {
    console.error('💥 Error setting up test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Disconnected from MongoDB');
  }
}

// Check if this script is being run directly
if (require.main === module) {
  setupOwnerTestData();
}

module.exports = { setupOwnerTestData };
