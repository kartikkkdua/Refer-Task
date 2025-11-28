# Refer-Task - Enterprise Referral Management System

A modern, full-stack referral rewards platform built for businesses with advanced user management, analytics, and admin capabilities.

##  Features

### User Features
- **Authentication System**: Secure login and registration with bcrypt password hashing
- **Unique Referral Codes**: Auto-generated 8-character codes for each user
- **Dual Rewards**: Both referrer and referee earn coins when a code is applied
- **User Dashboard**: 
  - Real-time statistics (total referrals, earnings, balance)
  - Referral code management with one-click copy
  - Transaction history
  - Top referrals list
- **Profile Management**: Update personal info, company details, phone, and avatar
- **Leaderboard**: See top earners with avatars and company info
- **Analytics**: Monthly stats, average earnings per referral, recent activity

### Business Features
- **Company Integration**: Users can add company information
- **Transaction Tracking**: Complete audit trail of all coin movements
- **User Status Management**: Active, inactive, or suspended accounts
- **Role-Based Access**: User and admin roles
- **Professional UI**: Modern glassmorphism design with smooth animations

### Admin Features
- **Admin Dashboard**: 
  - Total users and active users count
  - Total coins distributed
  - Transaction statistics
  - Recent user registrations
  - Top earners overview
- **User Management**: 
  - View all users with detailed information
  - Filter by status (active/inactive/suspended)
  - Change user status
  - View user statistics (referrals, earnings)
- **Analytics**: System-wide metrics and insights

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- bcryptjs for password hashing
- nanoid for unique code generation
- CORS enabled

**Frontend:**
- React 18
- Modern CSS with glassmorphism effects
- Component-based architecture
- LocalStorage for session persistence

##  Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)


##  Usage

### For Users
1. **Register**: Create account with name, email, password (optional: company, phone)
2. **Get Your Code**: Receive unique referral code automatically
3. **Share**: Share your code with others
4. **Apply Codes**: Use someone else's code to earn coins (one-time only)
5. **Track Progress**: View dashboard for stats and earnings
6. **Update Profile**: Add company info, phone, avatar

### For Admins
1. **Access Admin Panel**: Available in navigation for admin users
2. **Monitor System**: View dashboard metrics
3. **Manage Users**: Change user status, view details
4. **Track Performance**: See top earners and recent activity

##  Design Features

- **Glassmorphism UI**: Modern frosted glass effect with backdrop blur
- **Gradient Backgrounds**: Animated purple-pink gradient
- **Smooth Animations**: Card slides, hover effects, transitions
- **Responsive Design**: Mobile-friendly breakpoints
- **Professional Typography**: Clean, readable fonts
- **Color-Coded Status**: Visual indicators for user status
- **Interactive Elements**: Hover states, loading indicators

##  Database Models

### User Model
```javascript
{
  name, email, password, referralCode,
  coins, totalEarnings, referralCount,
  appliedReferral, referredBy,
  role, company, phone, status, avatar,
  lastLogin, createdAt, updatedAt
}
```

### Transaction Model
```javascript
{
  userId, type, amount, description,
  relatedUser, status, createdAt
}
```

### Config Model
```javascript
{
  key, value
}
```

##  Security Features

- Password hashing with bcrypt (10 rounds)
- Account status validation on login
- One-time referral code usage enforcement
- Self-referral prevention
- Input validation on all endpoints

##  API Endpoints

### Authentication
- `POST /api/register` - Create new account
- `POST /api/login` - User login

### Referrals
- `POST /api/apply-referral` - Apply referral code
- `GET /api/stats/:userId` - Get referral statistics
- `GET /api/leaderboard` - Get top earners

### Profile
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile/:userId` - Update profile

### Analytics
- `GET /api/analytics/:userId` - Get detailed analytics
- `GET /api/transactions/:userId` - Get transaction history

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/status` - Update user status
- `GET /api/admin/dashboard` - Get admin dashboard stats

##  Reward System

- Default reward: **50 coins** per referral (configurable)
- Both users receive coins when code is applied
- Tracks total earnings separately from current balance
- Transaction history for transparency
