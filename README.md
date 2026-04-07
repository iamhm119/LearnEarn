# Learn & Earn Platform 🚀

A high-performance, gamified learning platform designed for modern education. This platform rewards students with digital currency (Coins) and experience points (XP) for completing quizzes, participating in live events, and mastering learning paths.

## ✨ Key Features & Enhancements

### 🛍️ Reward Store & Gamification
- **Item Ecosystem**: A fully functional store where users can purchase digital items (Themes, Avatars, Boosts).
- **Persistent Themes**: Unlockable UI skins including **Sleek Dark Mode** and **Neon Cyber**. Themes are applied globally and persist across sessions via the user profile.
- **Profile Customization**: Equippable avatars with visual frames (Ninja Frame, Royal Crown) that appear on the dashboard and profile.
- **Productive Default**: A "Modern Light" theme option for users who prefer a calm, white-based workspace.

### 🏆 Competition & Events
- **Live Event System**: Real-time competitive quizzes with company sponsorships and automatic leaderboard generation.
- **Enrollment Flow**: Integrated enrollment system with automated feedback and status tracking.
- **High-Stakes Leaderboards**: Global rankings sorted by coins, XP, and streaks to drive engagement.

### 🛡️ Core Reliability & Performance
- **Coin Integrity Fix**: Resolved critical race conditions in the Reward Service to ensure coin balances are updated accurately during simultaneous quiz submissions.
- **Unified Auth Flow**: Synchronized global state management; active themes and items load instantly upon login or token verification.
- **SEO & Accessibility**: Implemented semantic HTML5 tags, unique IDs for testing, and optimized typography for professional readability.

### 📊 Advanced Analytics
- **Personal Dashboard**: Real-time tracking of XP progress, day streaks, and module completion.
- **Detailed Profile**: History of quiz scores with percentage-based success tracking and item inventory.

## 🛠️ Tech Stack

- **Frontend**: 
  - React.js with Context API for state management.
  - Tailwind CSS & Vanilla CSS for premium styling.
  - Lucide Icons & Framer Motion for interactivity.
- **Backend**: 
  - Node.js & Express.
  - MongoDB with Mongoose (optimized schemas for gamification).
  - JWT for secure authentication.
- **Real-Time**: 
  - Socket.io infrastructure for live event updates.

## 📦 Getting Started

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd learn-earn-platform
```

### 2. Backend Setup
1. Enter the server directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file with:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server: `npm start`

### 3. Frontend Setup
1. Enter the client directory: `cd client`
2. Install dependencies: `npm install`
3. Start the application: `npm start`

## 🎨 Design Philosophy
The platform follows a **"Calm but Dynamic"** aesthetic, using glassmorphism effects, a sophisticated HSL-based color palette, and micro-animations to create a premium, state-of-the-art user experience.

---
Built with ❤️ for the next generation of learners.
