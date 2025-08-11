## Complete Frontend-Database Integration Guide

### **Architecture Overview**

Our sports booking platform uses a **full-stack Next.js architecture** with the following integration layers:

```
Frontend (React) → API Routes (Next.js) → Database Models (MongoDB) → Database (MongoDB Atlas)
```

### **1. Database Layer (MongoDB + Mongoose)**

**Models Location**: `/models/Match.ts`

```javascript
// Match Schema with relationships
const matchSchema = new mongoose.Schema({
  sport: { type: String, required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now }
  }],
  date: { type: Date, required: true },
  time: { type: String, required: true },
  playersNeeded: { type: Number, required: true },
  prizeAmount: { type: Number, default: 0 },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['Open', 'Full', 'Cancelled', 'Completed'], 
    default: 'Open' 
  }
}, { timestamps: true })

// Virtual for dynamic participant count
matchSchema.virtual('playersJoined').get(function() {
  return this.participants.length
})

// Auto-update status when participants change
matchSchema.pre('save', function(next) {
  if (this.participants.length >= this.playersNeeded) {
    this.status = 'Full'
  } else if (this.status === 'Full' && this.participants.length < this.playersNeeded) {
    this.status = 'Open'
  }
  next()
})
```

### **2. API Layer (Next.js API Routes)**

**API Routes Location**: `/app/api/matches/`

#### **Main CRUD Operations** (`/app/api/matches/route.ts`)

```javascript
// GET: List all matches with filtering and population
export async function GET(request: Request) {
  const matches = await Match.find(query)
    .populate('venue', 'name')
    .populate('createdBy', 'name')
    .populate('participants.user', 'name')
    .sort({ createdAt: -1 })
  
  // Add user-specific flags (hasJoined, isCreator)
  const enrichedMatches = matches.map(match => ({
    ...match.toObject(),
    hasJoined: match.participants.some(p => p.user._id.toString() === userId),
    isCreator: match.createdBy._id.toString() === userId,
    playersJoined: match.participants.length
  }))
  
  return NextResponse.json(enrichedMatches)
}

// POST: Create new match with validation
export async function POST(request: Request) {
  const { sport, venueId, date, time, playersNeeded, prizeAmount, description } = await request.json()
  
  // Validate venue exists and supports the sport
  const venue = await Venue.findById(venueId)
  if (!venue || !venue.sports.includes(sport)) {
    return NextResponse.json({ error: 'Invalid venue for this sport' }, { status: 400 })
  }
  
  const match = new Match({
    sport,
    venue: venueId,
    date: new Date(date),
    time,
    playersNeeded,
    prizeAmount: prizeAmount || 0,
    description,
    createdBy: user.userId,
    participants: [{ user: user.userId }] // Creator auto-joins
  })
  
  await match.save()
  return NextResponse.json(match, { status: 201 })
}
```

#### **Join/Leave Operations** (`/app/api/matches/[id]/join/route.ts`)

```javascript
// POST: Join a match
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const match = await Match.findById(params.id)
  
  // Validation: Check if user already joined
  const alreadyJoined = match.participants.some(p => p.user.toString() === user.userId)
  if (alreadyJoined) {
    return NextResponse.json({ error: 'Already joined this match' }, { status: 400 })
  }
  
  // Validation: Check if match is full
  if (match.participants.length >= match.playersNeeded) {
    return NextResponse.json({ error: 'Match is full' }, { status: 400 })
  }
  
  // Add participant and update status
  match.participants.push({ user: user.userId })
  await match.save() // This triggers the pre-save hook to update status
  
  return NextResponse.json({ message: 'Successfully joined match' })
}

// DELETE: Leave a match
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const match = await Match.findById(params.id)
  
  // Remove participant
  match.participants = match.participants.filter(p => p.user.toString() !== user.userId)
  await match.save()
  
  return NextResponse.json({ message: 'Successfully left match' })
}
```

### **3. Authentication Middleware**

**Location**: `/lib/auth.ts`

```javascript
export function withAuth(handler: Function, allowedRoles?: string[]) {
  return async (request: Request) => {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split('Bearer ')[1]
    
    // Validate and decode token
    const user = jwt.verify(token, JWT_SECRET)
    
    // Check role permissions
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Pass user data to handler
    return handler(request, user)
  }
}
```

### **4. Frontend Integration (React)**

**Component Location**: `/app/matches/page.tsx`

#### **Data Fetching with Authentication**

```javascript
const loadMatches = async () => {
  const userStr = localStorage.getItem('user')
  const { token } = JSON.parse(userStr)
  
  const response = await fetch('/api/matches', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const matches = await response.json()
  setMatches(matches) // Contains hasJoined, isCreator flags
}
```

#### **Creating Matches**

```javascript
const createMatch = async (formData) => {
  const payload = {
    sport: formData.sport,
    venueId: formData.venueId,
    date: formData.date.toISOString().split('T')[0],
    time: formData.time,
    playersNeeded: parseInt(formData.playersNeeded),
    prizeAmount: parseFloat(formData.prizeAmount) || 0
  }
  
  const response = await fetch('/api/matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
  
  if (response.ok) {
    await loadMatches() // Refresh the list
  }
}
```

#### **Joining/Leaving Matches**

```javascript
const handleJoinMatch = async (matchId) => {
  const response = await fetch(`/api/matches/${matchId}/join`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (response.ok) {
    await loadMatches() // Refresh to show updated status
  }
}
```

### **5. Data Flow Example**

#### **Complete Join Match Flow:**

1. **User clicks "Join Match"** → `handleJoinMatch(matchId)` called
2. **Frontend sends authenticated request** → `POST /api/matches/123/join` with Bearer token
3. **API validates token** → `withAuth` middleware extracts user data
4. **API validates business rules** → Check if user already joined, match not full
5. **Database updated** → Add user to participants array, auto-update status
6. **Response sent back** → Success message or error
7. **Frontend refreshes** → `loadMatches()` called to show updated UI
8. **UI updates dynamically** → Button changes from "Join" to "Joined"

#### **Real-time State Updates:**

```javascript
// Before join: match.hasJoined = false
<Button onClick={() => handleJoinMatch(match._id)}>Join Match</Button>

// After successful join: match.hasJoined = true  
<Button variant="outline" onClick={() => handleLeaveMatch(match._id)}>
  Leave Match
</Button>
```

### **6. Key Integration Points**

#### **Authentication Flow:**
- User logs in → JWT token stored in localStorage
- Every API call includes `Authorization: Bearer ${token}` header
- Server validates token and extracts user info for database operations

#### **Data Relationships:**
- Matches reference Users (creator, participants) and Venues
- Mongoose populate() fills in related data automatically
- Virtual fields calculate dynamic values (playersJoined)

#### **State Management:**
- Frontend state syncs with database via API calls
- Loading states show progress during async operations
- Error handling provides user feedback

#### **Real-time Updates:**
- Every action (create, join, leave) triggers data refresh
- UI immediately reflects database changes
- Optimistic updates could be added for better UX

### **7. Testing the Integration**

You can test each layer independently:

```bash
# Test API endpoints directly
curl -X GET http://localhost:3000/api/matches \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test database operations
npm run seed  # Add sample data
```

This architecture provides a **complete separation of concerns** while maintaining **seamless data flow** between frontend and database through well-defined API contracts.
