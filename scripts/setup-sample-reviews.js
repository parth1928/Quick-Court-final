const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

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

const VenueSchema = new mongoose.Schema({
  name: String,
  shortLocation: String,
  fullAddress: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'active' },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'venues' });

const ReviewSchema = new mongoose.Schema({
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'reviews' });

const User = mongoose.model('User', UserSchema);
const Venue = mongoose.model('Venue', VenueSchema);
const Review = mongoose.model('Review', ReviewSchema);

async function setupSampleReviews() {
  try {
    await dbConnect();

    console.log('🔍 Looking for venues and users...');
    
    // Find venues and users
    const venues = await Venue.find({ deletedAt: null }).limit(5);
    const users = await User.find({ role: 'user' }).limit(10);
    
    console.log(`🏢 Found ${venues.length} venues`);
    console.log(`👥 Found ${users.length} users`);

    if (venues.length === 0) {
      console.log('❌ No venues found! Please create venues first.');
      return;
    }

    if (users.length === 0) {
      console.log('❌ No users found! Creating sample users...');
      
      // Create sample users
      const sampleUsers = [
        { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: 'user', password: '$2b$10$hashedpassword', phone: '+91-9876543210' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', role: 'user', password: '$2b$10$hashedpassword', phone: '+91-9876543211' },
        { firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@example.com', role: 'user', password: '$2b$10$hashedpassword', phone: '+91-9876543212' },
        { firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@example.com', role: 'user', password: '$2b$10$hashedpassword', phone: '+91-9876543213' },
        { firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com', role: 'user', password: '$2b$10$hashedpassword', phone: '+91-9876543214' }
      ];
      
      for (const userData of sampleUsers) {
        const user = new User(userData);
        await user.save();
        users.push(user);
        console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
      }
    }

    // Sample review templates
    const reviewTemplates = [
      { rating: 5, comment: "Absolutely fantastic venue! The facilities are top-notch and the staff is incredibly helpful. The courts are well-maintained and the booking process was seamless. Highly recommend!" },
      { rating: 4, comment: "Great experience overall. The venue is clean and well-equipped. Only minor issue was the parking could be better, but everything else was excellent." },
      { rating: 5, comment: "Outstanding venue with amazing amenities. The location is perfect and easily accessible. The courts are professional grade and perfect for serious games." },
      { rating: 3, comment: "Good venue but could use some improvements. The courts are decent but the waiting area needs better seating. Staff was friendly though." },
      { rating: 4, comment: "Really enjoyed playing here. The atmosphere is great and the facilities are modern. Will definitely book again for future games." },
      { rating: 5, comment: "Perfect venue for tournaments and casual games alike. The quality of courts is exceptional and the lighting is excellent even for evening games." },
      { rating: 2, comment: "Had some issues with the booking system and the courts weren't as clean as expected. However, the location is convenient." },
      { rating: 4, comment: "Solid venue with good facilities. The courts are well-maintained and the pricing is fair. Staff could be more responsive but overall good experience." },
      { rating: 5, comment: "Exceeded my expectations! The venue is modern, clean, and has all the amenities needed. The online booking system works flawlessly." },
      { rating: 3, comment: "Average experience. The courts are okay but nothing special. Good for casual games but serious players might want to look elsewhere." }
    ];

    let totalReviewsCreated = 0;

    // Create reviews for each venue
    for (const venue of venues) {
      console.log(`\n📝 Creating reviews for venue: ${venue.name}`);
      
      // Check existing reviews
      const existingReviews = await Review.find({ venue: venue._id, deletedAt: null });
      console.log(`   📊 Existing reviews: ${existingReviews.length}`);
      
      // Create 3-7 reviews per venue if they don't have many
      const reviewsToCreate = Math.max(0, Math.min(7, 5 - existingReviews.length));
      
      if (reviewsToCreate === 0) {
        console.log(`   ⏭️ Venue already has enough reviews, skipping...`);
        continue;
      }
      
      // Shuffle users and review templates
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      const shuffledTemplates = [...reviewTemplates].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < reviewsToCreate && i < shuffledUsers.length; i++) {
        const user = shuffledUsers[i];
        const template = shuffledTemplates[i % shuffledTemplates.length];
        
        // Check if this user already reviewed this venue
        const existingUserReview = await Review.findOne({
          venue: venue._id,
          user: user._id,
          deletedAt: null
        });
        
        if (existingUserReview) {
          console.log(`   ⏭️ User ${user.firstName} already reviewed this venue, skipping...`);
          continue;
        }
        
        // Create review with some variation in the past
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
        
        const review = new Review({
          venue: venue._id,
          user: user._id,
          rating: template.rating,
          comment: template.comment,
          createdBy: user._id,
          createdAt: reviewDate,
          updatedAt: reviewDate
        });
        
        await review.save();
        totalReviewsCreated++;
        
        console.log(`   ✅ Created review: ${template.rating}⭐ by ${user.firstName} ${user.lastName}`);
      }
    }

    console.log(`\n🎉 Successfully created ${totalReviewsCreated} sample reviews!`);
    
    // Update venue ratings (the post-save hook should do this, but let's ensure it)
    console.log('\n📊 Updating venue ratings...');
    
    for (const venue of venues) {
      const reviews = await Review.find({ venue: venue._id, deletedAt: null });
      
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        venue.rating = Math.round(averageRating * 10) / 10;
        venue.reviewCount = reviews.length;
        await venue.save();
        
        console.log(`   ✅ Updated ${venue.name}: ${venue.rating}⭐ (${venue.reviewCount} reviews)`);
      }
    }
    
    console.log('\n📈 Final summary:');
    const totalVenues = await Venue.countDocuments({ deletedAt: null });
    const totalReviews = await Review.countDocuments({ deletedAt: null });
    const avgReviewsPerVenue = totalReviews / totalVenues;
    
    console.log(`   🏢 Total Venues: ${totalVenues}`);
    console.log(`   📝 Total Reviews: ${totalReviews}`);
    console.log(`   📊 Average Reviews per Venue: ${avgReviewsPerVenue.toFixed(1)}`);
    
  } catch (error) {
    console.error('💥 Error setting up sample reviews:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Disconnected from MongoDB');
  }
}

// Check if this script is being run directly
if (require.main === module) {
  setupSampleReviews();
}

module.exports = { setupSampleReviews };
