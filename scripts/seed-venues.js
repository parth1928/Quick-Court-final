// Comprehensive venue seed with all schema fields populated
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI missing');

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: String,
  avatar: { type: String, default: '/placeholder-user.jpg' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Venue Schema
const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shortLocation: String,
  fullAddress: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  contactNumber: String,
  contactPhone: String,
  contactEmail: String,
  mapLink: String,
  description: { type: String, required: true },
  sports: [String],
  amenities: [String],
  images: [String],
  photos: [String],
  startingPrice: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  defaultAvailableSlots: [String],
  embeddedReviews: [{
    userName: String,
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Venue = mongoose.model('Venue', venueSchema);

function buildOpeningHours(open = '06:00', close = '22:00') {
  return {
    monday: { open, close },
    tuesday: { open, close },
    wednesday: { open, close },
    thursday: { open, close },
    friday: { open, close },
    saturday: { open, close },
    sunday: { open, close }
  };
}

const SLOT_TEMPLATE = [
  '06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM','08:00 PM','09:00 PM'
];

async function ensureOwner(email, name) {
  let owner = await User.findOne({ email });
  if (!owner) {
    owner = await User.create({
      name,
      email,
      password: 'Password123!',
      role: 'owner',
      phone: '+91 90000 00000'
    });
    console.log('Created owner user', email);
  }
  return owner;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  try {
    const primaryOwner = await ensureOwner('demo.owner@example.com', 'Demo Owner');
    const secondaryOwner = await ensureOwner('sports.owner@example.com', 'Sports Owner');

    const venues = [
      {
        name: 'Community Recreation Center',
        shortLocation: 'Koramangala, Bengaluru',
        fullAddress: '456 7th Block, Koramangala, Bengaluru, Karnataka 560095',
        address: { street: '456 7th Block', city: 'Bengaluru', state: 'Karnataka', zipCode: '560095', country: 'India' },
        contactNumber: '+91 91234 56789',
        contactPhone: '+91 91234 56789',
        contactEmail: 'contact@crcblr.in',
        mapLink: 'https://maps.google.com/?q=Koramangala+Bengaluru',
        description: 'Affordable multi-sport community space offering badminton, volleyball and table tennis with clean locker rooms and friendly staff.',
        sports: ['Volleyball', 'Badminton', 'Table Tennis'],
        amenities: ['Parking', 'Locker Rooms', 'Drinking Water', 'First Aid', 'Washrooms'],
        images: ['https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80'],
        photos: ['https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80'],
        startingPrice: 300,
        rating: 4.6,
        reviewCount: 89,
        approvalStatus: 'approved',
        status: 'approved',
        owner: primaryOwner._id,
        location: { type: 'Point', coordinates: [77.6271, 12.9352] },
        openingHours: buildOpeningHours('06:00','21:00'),
        defaultAvailableSlots: SLOT_TEMPLATE,
        embeddedReviews: [
          { userName: 'Rahul Verma', rating: 5, comment: 'Affordable and friendly!' },
          { userName: 'Sneha Rao', rating: 4, comment: 'Good for families.' }
        ]
      },
      {
        name: 'Elite Sports Complex',
        shortLocation: 'Andheri, Mumbai',
        fullAddress: '12 Sports Avenue, Andheri West, Mumbai, Maharashtra 400053',
        address: { street: '12 Sports Avenue', city: 'Mumbai', state: 'Maharashtra', zipCode: '400053', country: 'India' },
        contactNumber: '+91 98765 43210',
        contactPhone: '+91 98765 43210',
        contactEmail: 'info@elitesports.in',
        mapLink: 'https://maps.google.com/?q=Andheri+Mumbai',
        description: 'Premium indoor and outdoor courts with professional-grade surfaces, lighting and on-site cafeteria.',
        sports: ['Basketball', 'Tennis', 'Volleyball'],
        amenities: ['Parking', 'Locker Rooms', 'Cafeteria', 'Pro Shop', 'Physio Corner'],
        images: ['https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80'],
        photos: ['https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80'],
        startingPrice: 500,
        rating: 4.8,
        reviewCount: 124,
        approvalStatus: 'approved',
        status: 'approved',
        owner: primaryOwner._id,
        location: { type: 'Point', coordinates: [72.8284, 19.1197] },
        openingHours: buildOpeningHours('05:30','22:30'),
        defaultAvailableSlots: SLOT_TEMPLATE,
        embeddedReviews: [
          { userName: 'Anil Kumar', rating: 5, comment: 'Great courts and staff!' },
          { userName: 'Priya Shah', rating: 5, comment: 'Loved the facilities.' }
        ]
      },
      {
        name: 'Hyderabad Smash Arena',
        shortLocation: 'Gachibowli, Hyderabad',
        fullAddress: 'Plot 21, Tech Valley Road, Gachibowli, Hyderabad, Telangana 500032',
        address: { street: 'Plot 21 Tech Valley Road', city: 'Hyderabad', state: 'Telangana', zipCode: '500032', country: 'India' },
        contactNumber: '+91 90123 45678',
        contactPhone: '+91 90123 45678',
        contactEmail: 'support@smasharena.in',
        mapLink: 'https://maps.google.com/?q=Gachibowli+Hyderabad',
        description: 'Specialized badminton & squash arena with cushion courts and LED lighting designed for competitive play.',
        sports: ['Badminton', 'Squash', 'Table Tennis'],
        amenities: ['Parking', 'Locker Rooms', 'Shower', 'Coaching', 'Drinking Water'],
        images: ['https://images.unsplash.com/photo-1603722038717-3f122eaea9f7?auto=format&fit=crop&w=800&q=80'],
        photos: ['https://images.unsplash.com/photo-1603722038717-3f122eaea9f7?auto=format&fit=crop&w=800&q=80'],
        startingPrice: 280,
        rating: 4.5,
        reviewCount: 57,
        approvalStatus: 'approved',
        status: 'approved',
        owner: secondaryOwner._id,
        location: { type: 'Point', coordinates: [78.3564, 17.4401] },
        openingHours: buildOpeningHours('05:00','23:00'),
        defaultAvailableSlots: SLOT_TEMPLATE,
        embeddedReviews: [
          { userName: 'Kiran R', rating: 5, comment: 'Excellent lighting and courts.' },
          { userName: 'Lavanya S', rating: 4, comment: 'Great coaching sessions.' }
        ]
      },
      {
        name: 'Chennai Coastal Courts',
        shortLocation: 'Besant Nagar, Chennai',
        fullAddress: '18 Shoreline Road, Besant Nagar, Chennai, Tamil Nadu 600090',
        address: { street: '18 Shoreline Road', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600090', country: 'India' },
        contactNumber: '+91 92222 33344',
        contactPhone: '+91 92222 33344',
        contactEmail: 'hello@coastalcourts.in',
        mapLink: 'https://maps.google.com/?q=Besant+Nagar+Chennai',
        description: 'Open-air and semi-indoor multi-sport facility near the beach with refreshing breeze and night lighting.',
        sports: ['Tennis', 'Basketball', 'Football'],
        amenities: ['Parking', 'Refreshments', 'Washrooms', 'First Aid', 'Drinking Water'],
        images: ['https://images.unsplash.com/photo-1505666287802-931dc83948e0?auto=format&fit=crop&w=800&q=80'],
        photos: ['https://images.unsplash.com/photo-1505666287802-931dc83948e0?auto=format&fit=crop&w=800&q=80'],
        startingPrice: 450,
        rating: 4.4,
        reviewCount: 38,
        approvalStatus: 'approved',
        status: 'approved',
        owner: secondaryOwner._id,
        location: { type: 'Point', coordinates: [80.2707, 13.0027] },
        openingHours: buildOpeningHours('06:00','22:00'),
        defaultAvailableSlots: SLOT_TEMPLATE,
        embeddedReviews: [
          { userName: 'Suresh Iyer', rating: 5, comment: 'Sea breeze while playing tennis is amazing.' },
          { userName: 'Divya P', rating: 4, comment: 'Nice ambiance and decent pricing.' }
        ]
      },
      {
        name: 'Pune Fitness & Turf Hub',
        shortLocation: 'Baner, Pune',
        fullAddress: '72 Innovation Park, Baner, Pune, Maharashtra 411045',
        address: { street: '72 Innovation Park', city: 'Pune', state: 'Maharashtra', zipCode: '411045', country: 'India' },
        contactNumber: '+91 93333 44455',
        contactPhone: '+91 93333 44455',
        contactEmail: 'admin@puneturfhub.in',
        mapLink: 'https://maps.google.com/?q=Baner+Pune',
        description: 'Synthetic turf grounds and functional fitness zones ideal for football, fitness bootcamps and casual games.',
        sports: ['Football', 'Cricket', 'Fitness'],
        amenities: ['Parking', 'Washrooms', 'Equipment Rental', 'CCTV', 'Seating'],
        images: ['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80'],
        photos: ['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80'],
        startingPrice: 600,
        rating: 4.7,
        reviewCount: 61,
        approvalStatus: 'approved',
        status: 'approved',
        owner: primaryOwner._id,
        location: { type: 'Point', coordinates: [73.7806, 18.5590] },
        openingHours: buildOpeningHours('05:30','23:00'),
        defaultAvailableSlots: SLOT_TEMPLATE,
        embeddedReviews: [
          { userName: 'Aditya Joshi', rating: 5, comment: 'Great turf quality.' },
          { userName: 'Meera Kulkarni', rating: 4, comment: 'Clean and well managed.' }
        ]
      },
      {
        name: 'Delhi Indoor Sports Hub',
        shortLocation: 'Dwarka, New Delhi',
        fullAddress: 'Plot 9 Sector 10, Dwarka, New Delhi 110075',
        address: { street: 'Plot 9 Sector 10', city: 'New Delhi', state: 'Delhi', zipCode: '110075', country: 'India' },
        contactNumber: '+91 94444 55566',
        contactPhone: '+91 94444 55566',
        contactEmail: 'desk@delhiindoorhub.in',
        mapLink: 'https://maps.google.com/?q=Dwarka+New+Delhi',
        description: 'Climate-controlled indoor facility for year-round play featuring badminton, table tennis and basketball half courts.',
        sports: ['Badminton', 'Table Tennis', 'Basketball'],
        amenities: ['Parking', 'Locker Rooms', 'AC Hall', 'Drinking Water', 'First Aid'],
        images: ['https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=800&q=80'],
        photos: ['https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=800&q=80'],
        startingPrice: 350,
        rating: 4.3,
        reviewCount: 47,
        approvalStatus: 'approved',
        status: 'approved',
        owner: secondaryOwner._id,
        location: { type: 'Point', coordinates: [77.0431, 28.5921] },
        openingHours: buildOpeningHours('06:00','22:30'),
        defaultAvailableSlots: SLOT_TEMPLATE,
        embeddedReviews: [
          { userName: 'Neha Singh', rating: 4, comment: 'Good ventilation and lighting.' },
          { userName: 'Varun Mehta', rating: 5, comment: 'Courts are well maintained.' }
        ]
      }
    ];

    for (const data of venues) {
      const existing = await Venue.findOne({ name: data.name });
      if (existing) {
        await Venue.updateOne({ _id: existing._id }, { $set: data });
        console.log('Updated venue:', data.name);
      } else {
        await Venue.create(data);
        console.log('Created venue:', data.name);
      }
    }

    console.log('Venue seed completed.');
  } catch (e) {
    console.error('Seed error', e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
