// Tournament seed data
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

// Tournament Schema
const participantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  team: { type: String },
  registrationDate: { type: Date, default: Date.now }
}, { _id: false });

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true },
  category: { type: String },
  venue: { type: String },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  maxParticipants: { type: Number, required: true },
  entryFee: { type: Number, default: 0 },
  prizePool: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft','submitted','approved','open','closed','ongoing','completed','cancelled'], 
    default: 'open' 
  },
  difficulty: { type: String, enum: ['Beginner','Intermediate','Advanced','Professional'], default: 'Beginner' },
  description: { type: String },
  organizer: { type: String },
  organizerContact: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [participantSchema],
  rules: [{ type: String }],
  schedule: [{
    date: Date,
    time: String,
    event: String,
    location: String
  }],
  prizes: [{
    position: String,
    prize: String,
    amount: Number
  }],
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Tournament = mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema);

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
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Ensure owners exist
    const owner1 = await ensureOwner('tournament.owner@example.com', 'Tournament Organizer');
    const owner2 = await ensureOwner('sports.organizer@example.com', 'Sports Manager');

    // Clear existing tournaments
    await Tournament.deleteMany({});
    console.log('Cleared existing tournaments');

    const tournaments = [
      {
        name: "Mumbai Basketball Premier League",
        sport: "Basketball",
        category: "5v5",
        venue: "NSCI Indoor Stadium",
        location: "Mumbai, Maharashtra",
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-25'),
        registrationDeadline: new Date('2025-01-10'),
        maxParticipants: 12,
        entryFee: 5000,
        prizePool: 100000,
        status: "open",
        difficulty: "Professional",
        description: "Participate in Mumbai's biggest basketball league. Open to all professional and semi-professional teams.",
        organizer: "Mumbai Basketball Association",
        organizerContact: "contact@mba.in",
        createdBy: owner1._id,
        rules: [
          "Teams must have 5 players + 3 substitutes",
          "All players must be 16+ years old",
          "Standard FIBA rules apply",
          "Entry fee includes GST and court charges"
        ],
        prizes: [
          { position: "1st", prize: "Trophy + Cash", amount: 50000 },
          { position: "2nd", prize: "Medal + Cash", amount: 30000 },
          { position: "3rd", prize: "Medal + Cash", amount: 20000 }
        ]
      },
      {
        name: "Chennai Tennis Challenge",
        sport: "Tennis",
        category: "Singles",
        venue: "SDAT Tennis Stadium",
        location: "Chennai, Tamil Nadu",
        startDate: new Date('2025-02-05'),
        endDate: new Date('2025-02-10'),
        registrationDeadline: new Date('2025-01-25'),
        maxParticipants: 32,
        entryFee: 3000,
        prizePool: 50000,
        status: "open",
        difficulty: "Intermediate",
        description: "Show your skills at the Chennai Tennis Challenge. Open for all state-level players.",
        organizer: "Tamil Nadu Tennis Association",
        organizerContact: "info@tnta.in",
        createdBy: owner2._id,
        rules: [
          "Single players only",
          "All players must be 15+ years old",
          "Standard ITF rules apply",
          "Entry fee includes GST"
        ],
        prizes: [
          { position: "Winner", prize: "Trophy + Cash", amount: 25000 },
          { position: "Runner-up", prize: "Medal + Cash", amount: 15000 },
          { position: "Semi-finalist", prize: "Medal + Cash", amount: 5000 }
        ]
      },
      {
        name: "Hyderabad Badminton Open",
        sport: "Badminton",
        category: "Singles",
        venue: "Gachibowli Indoor Stadium",
        location: "Hyderabad, Telangana",
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-03'),
        registrationDeadline: new Date('2025-02-20'),
        maxParticipants: 16,
        entryFee: 2000,
        prizePool: 40000,
        status: "open",
        difficulty: "Intermediate",
        description: "Competitive badminton tournament for intermediate players. Both men's and women's categories.",
        organizer: "Hyderabad Sports Club",
        organizerContact: "tournaments@hsc.in",
        createdBy: owner1._id,
        rules: [
          "BWF rules and regulations",
          "Best of 3 games format",
          "Players must bring their own rackets"
        ],
        prizes: [
          { position: "Champion", prize: "Trophy + Cash", amount: 20000 },
          { position: "Runner-up", prize: "Medal + Cash", amount: 12000 },
          { position: "3rd Place", prize: "Medal + Cash", amount: 8000 }
        ]
      },
      {
        name: "Delhi Football League",
        sport: "Football",
        category: "11v11",
        venue: "Jawaharlal Nehru Stadium",
        location: "Delhi",
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-04-15'),
        registrationDeadline: new Date('2025-03-15'),
        maxParticipants: 16,
        entryFee: 8000,
        prizePool: 200000,
        status: "open",
        difficulty: "Professional",
        description: "Professional football league with teams from across Delhi. High-level competition with scout presence.",
        organizer: "Delhi Football Association",
        organizerContact: "league@dfa.in",
        createdBy: owner2._id,
        rules: [
          "FIFA rules and regulations",
          "Teams must have 11 players + 7 substitutes",
          "All players must be 16+ years old",
          "Medical certificate required"
        ],
        prizes: [
          { position: "Champions", prize: "Trophy + Cash", amount: 100000 },
          { position: "Runners-up", prize: "Medal + Cash", amount: 60000 },
          { position: "3rd Place", prize: "Medal + Cash", amount: 40000 }
        ]
      },
      {
        name: "Bangalore Table Tennis Championship",
        sport: "Table Tennis",
        category: "Singles",
        venue: "Karnataka State Badminton Association",
        location: "Bangalore, Karnataka",
        startDate: new Date('2025-02-20'),
        endDate: new Date('2025-02-22'),
        registrationDeadline: new Date('2025-02-10'),
        maxParticipants: 24,
        entryFee: 1500,
        prizePool: 25000,
        status: "open",
        difficulty: "Beginner",
        description: "Fun and competitive table tennis tournament for beginners and intermediate players.",
        organizer: "Bangalore TT Club",
        organizerContact: "events@blrtt.in",
        createdBy: owner1._id,
        rules: [
          "ITTF rules apply",
          "Best of 5 games in finals",
          "Players must bring their own paddles"
        ],
        prizes: [
          { position: "Winner", prize: "Trophy + Cash", amount: 12000 },
          { position: "Runner-up", prize: "Medal + Cash", amount: 8000 },
          { position: "3rd Place", prize: "Medal + Cash", amount: 5000 }
        ]
      }
    ];

    // Insert tournaments
    const createdTournaments = await Tournament.insertMany(tournaments);
    console.log(`Created ${createdTournaments.length} tournaments`);

    console.log('Tournament seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding tournaments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

run();
