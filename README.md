# QuickCourt - Sports Venue Booking Platform

A comprehensive sports venue booking platform built with Next.js, TypeScript, and MongoDB. QuickCourt allows users to discover, book, and manage sports venues while providing facility owners with tools to manage their courts and bookings.

## 🚀 Features

### For Users
- **Venue Discovery**: Browse and search sports venues by location, sport type, and amenities
- **Court Booking**: Real-time availability checking and booking system
- **Game Organization**: Create and join pickup games with other players
- **Tournament Management**: Participate in tournaments and competitions
- **Profile Management**: Track bookings, game history, and preferences
- **Secure Payments**: Integrated payment system with transaction history

### For Facility Owners
- **Facility Management**: Add and manage multiple sports facilities
- **Court Management**: Configure courts, sports, and pricing
- **Booking Overview**: Real-time dashboard for tracking bookings and revenue
- **Time Slot Management**: Flexible scheduling and availability management
- **Tournament Hosting**: Host and manage tournaments at your venue
- **Analytics**: Revenue and booking analytics with detailed reports

### For Administrators
- **User Management**: Manage user accounts and permissions
- **Facility Approval**: Review and approve new facility registrations
- **Content Moderation**: Monitor and moderate user-generated content
- **System Reports**: Comprehensive platform analytics and reporting

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with 2FA support
- **Email**: Nodemailer for transactional emails
- **Charts**: Chart.js, Recharts
- **Payments**: Custom payment simulator (ready for real payment gateway integration)

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quick-court.git
   cd quick-court
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   
   # Email Configuration
   EMAIL_HOST=your_smtp_host
   EMAIL_PORT=587
   EMAIL_USER=your_email_username
   EMAIL_PASS=your_email_password
   EMAIL_FROM=noreply@quickcourt.com
   
   # App Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── admin-dashboard/   # Admin panel
│   ├── facility-dashboard/# Facility owner dashboard
│   ├── user-home/         # User dashboard
│   ├── venues/            # Venue pages
│   ├── booking/           # Booking system
│   └── ...
├── components/            # Reusable React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...
├── lib/                  # Utility functions and configurations
├── models/               # MongoDB/Mongoose models
├── hooks/                # Custom React hooks
├── scripts/              # Database seeding and utility scripts
├── public/               # Static assets
└── styles/               # Global styles
```

## 🗄 Database Models

- **User**: User accounts with role-based permissions
- **Venue**: Sports facilities and their details
- **Court**: Individual courts within venues
- **Booking**: Court reservations and bookings
- **Match**: Organized games and matches
- **Tournament**: Tournament management
- **TimeSlot**: Available time slots for bookings
- **OTP**: Two-factor authentication support

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data
- `npm run seed:venues` - Seed venues specifically
- `npm run test:email` - Test email configuration
- `npm run test:mongo` - Test MongoDB connection
- `npm run test:otp` - Test OTP system
- `npm run test:2fa` - Run all 2FA tests

## 🔐 Authentication & Security

- JWT-based authentication with refresh tokens
- Two-factor authentication (2FA) support
- Role-based access control (Admin, Facility Owner, User)
- Password hashing with bcryptjs
- Rate limiting for API endpoints
- Input validation and sanitization

## 💳 Payment Integration

The project includes a payment simulator for testing. To integrate with real payment gateways:

1. Replace the PaySimulator component with your preferred payment provider
2. Update the payment API routes in `/app/api/payment/`
3. Configure webhook handling for payment confirmations

## 📱 Responsive Design

QuickCourt is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/yourusername/quick-court/issues) page to report bugs or request features.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@quickcourt.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

---

*Made with ❤ for the sports community*
