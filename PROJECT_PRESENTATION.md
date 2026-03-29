# LearnGPT — AI-Powered Learning Management System (LMS)
### Full-Stack MERN Project Presentation

---

## Slide 1: Project Title & Overview

# 🎓 LearnGPT
## An AI-Powered Learning Management System

**Built with the MERN Stack**
MongoDB | Express.js | React | Node.js

> A comprehensive, feature-rich educational platform that empowers instructors to create and sell courses, and students to learn, track progress, and interact in real-time — enhanced by AI assistance.

---

## Slide 2: Problem Statement

### The Problem with Traditional E-Learning

- 📚 Traditional LMS platforms are **static and non-interactive**
- ❌ No real-time communication between students and instructors
- 🤖 Zero AI assistance for course creation or learning
- 💸 Complex and expensive payment integrations
- 📊 Poor analytics and progress tracking for both learners and instructors
- 🎥 Limited video streaming capabilities
- 🔐 Weak role management (no multi-role support)

### Our Solution
LearnGPT solves all of the above with a modern, AI-enhanced, real-time LMS that bridges the gap between instructors and students.

---

## Slide 3: Key Objectives

### Project Goals

1. **Build a full-featured LMS** with course creation, enrollment, and progress tracking
2. **Integrate AI features** to assist instructors generate course content automatically
3. **Enable real-time communication** with Socket.io-powered chat
4. **Support live sessions** with scheduling, recording, and playback
5. **Implement secure payments** via Razorpay for course purchases
6. **Provide comprehensive dashboards** for Admin, Instructor, and Student roles
7. **Design a fully responsive UI** with modern aesthetics using TailwindCSS

---

## Slide 4: Technology Stack

### Frontend Technologies

| Technology | Purpose |
|---|---|
| **React (Vite)** | Fast, modern frontend framework |
| **Redux Toolkit** | Global state management |
| **Redux Persist** | Persist authentication state |
| **TailwindCSS** | Utility-first responsive styling |
| **Headless UI / Radix UI** | Accessible, unstyled UI primitives |
| **Framer Motion** | Smooth animations and transitions |
| **Socket.io-client** | Real-time communication |
| **Recharts / Chart.js** | Dashboard data visualizations |
| **Axios** | HTTP client for API calls |
| **TipTap Editor** | Rich text course content creation |

### Backend Technologies

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | RESTful API framework |
| **MongoDB + Mongoose** | NoSQL database with ODM |
| **JWT (JSON Web Tokens)** | Secure authentication |
| **BcryptJS** | Password hashing |
| **Cloudinary** | Cloud-based media storage |
| **Razorpay** | Payment gateway integration |
| **Socket.io** | Real-time bidirectional events |
| **Groq API (LLaMA 3.1)** | AI-powered content generation |
| **Google Generative AI (Gemini)** | Additional AI assistance |
| **Multer** | File upload middleware |
| **Morgan** | HTTP request logging |

---

## Slide 5: System Architecture

### High-Level Architecture

```
[Client - React/Vite]
        │
        ├── Redux Store (State Management)
        ├── REST API Calls (Axios)
        └── WebSocket Connection (Socket.io-client)
                │
        [Server - Node.js / Express.js]
                │
        ├── REST API Routes (11 Route Modules)
        ├── Socket.io Server (Real-time)
        ├── Middleware (Auth, Multer, CORS)
        ├── Controllers (Business Logic)
                │
        ├── [MongoDB - Mongoose]   ← Primary Database
        ├── [Cloudinary]           ← Media Storage
        ├── [Razorpay]             ← Payment Gateway
        └── [Groq / Gemini AI]    ← AI Services
```

### Communication Flow
- **HTTP REST** — Course CRUD, User Auth, Payments, Progress
- **WebSocket (Socket.io)** — Real-time chat, Live session events
- **Cloudinary CDN** — Video streaming, image hosting
- **Razorpay Webhooks** — Payment verification

---

## Slide 6: User Roles & Access Control

### Multi-Role Identity System

The platform supports **3 distinct user roles** with dynamic role switching:

#### 🎓 Student (Default Role)
- Browse and search courses
- Enroll in courses (free or paid)
- Watch video lectures
- Track learning progress
- Join live sessions
- Real-time course chat
- Download certificates
- Manage wishlist
- Rate and review courses

#### 👨‍🏫 Instructor
- Apply to become an instructor (admin approval workflow)
- Create and publish courses
- Upload video lectures and resources
- Manage course modules and curriculum
- Schedule and host live sessions
- View revenue and wallet balance
- Track student enrollments
- Access reputation scoring system
- Generate AI-powered course content

#### 🔐 Admin (Super User)
- Full dashboard with platform analytics
- Manage all users (approve/reject instructors)
- Monitor revenue and transactions
- View all courses on the platform
- Manage wallet payouts
- Access reputation reports

---

## Slide 7: Core Features — Course Management

### 📚 Course Creation & Management

**For Instructors:**
- Create courses with **title, subtitle, category, level, and pricing**
- **AI-Powered Content Generation** using Groq LLaMA 3.1:
  - Auto-generate course subtitle
  - Auto-generate full HTML course description
- Upload **course thumbnail** via Cloudinary
- Organize content into **Modules** → **Lectures**
- Upload **video lectures** with HLS (HTTP Live Streaming) support
- Add downloadable **resources** per lecture
- Set learning goals and course requirements
- Publish / Unpublish courses

**Course Data Model:**
```
Course {
  courseTitle, subTitle, courseDescription
  category, courseLevel (Beginner/Intermediate/Advanced/Expert)
  coursePrice, courseThumbnail
  modules[] → Module → Lecture[]
  enrolledStudents[], creator
  averageRating, totalRatings, ratingDistribution
  rankingScore, ispublished
}
```

**For Students:**
- Browse courses with **advanced filters** (category, level, price, rating)
- View detailed course page with preview
- **Wishlist** courses for later
- Purchase courses via Razorpay
- Access full curriculum after enrollment

---

## Slide 8: Core Features — Video Learning & Progress

### 🎥 Video Streaming & Progress Tracking

**Video Capabilities:**
- Adaptive HLS video playback
- Lecture-by-lecture navigation
- Resume from last watched position
- Notes and bookmarking per lecture

**Progress Tracking System:**
```
CourseProgress {
  userId, courseId
  completedLectures[]
  progressPercentage
  lastAccessedAt
}
```

**Student Dashboard Features:**
- Visual progress bars per enrolled course
- List of completed vs pending lectures
- Resume learning from last position
- Certificate generation on course completion (using jsPDF + html2canvas)

---

## Slide 9: Core Features — Live Sessions

### 🔴 Live Session System

**Instructor Capabilities:**
- Schedule live sessions for enrolled students
- Set title, description, date/time, and duration (5–480 min)
- Start/end live sessions from the dashboard
- View list of past and upcoming sessions

**Student Capabilities:**
- View upcoming live sessions in a **Calendar view**
- Join live sessions (auto-redirected when session goes live)
- Access recorded sessions after the session ends

**Technical Implementation:**
- WebRTC integration for live video/audio
- Socket.io signaling for real-time room management
- Session recording via Cloudinary
- Unique Room ID generated with `crypto.randomBytes`

**Live Session Data Model:**
```
LiveSession {
  title, description, courseId, instructorId
  scheduledAt, duration
  status: scheduled | live | ended | cancelled
  roomId (unique, auto-generated)
  participants[] → {userId, joinedAt, leftAt}
  recordingUrl, startedAt, endedAt
}
```

---

## Slide 10: Core Features — Real-Time Chat

### 💬 Real-Time Course Chat

**What It Does:**
- Every enrolled course has its own dedicated **chat room**
- Students and instructors can communicate in real-time
- Messages are persisted to MongoDB
- Emoji support and rich messaging

**Technical Stack:**
- **Socket.io** for bidirectional events
- Room-based architecture (one room per course)
- `ChatMessage` model for persistence

**Chat Data Model:**
```
ChatMessage {
  courseId, senderId, senderName
  message, timestamp
}
```

**Chat Architecture:**
- Client emits `join_room` with courseId on page load
- Server broadcasts messages to all room participants
- Offline messages are fetched via REST API on room join

---

## Slide 11: Core Features — Payment System

### 💳 Razorpay Payment Integration

**Payment Flow:**
1. Student clicks "Enroll Now" on a paid course
2. Backend creates a **Razorpay Order**
3. Frontend opens **Razorpay Payment Modal**
4. Student completes payment (UPI, card, net banking)
5. Backend verifies payment using **HMAC SHA-256 signature**
6. On success: student is enrolled, instructor wallet is credited

**Instructor Wallet System:**
- 70% of course revenue credited to instructor wallet
- Real-time wallet balance display
- Transaction history with course-level breakdown
- Payout request feature for instructors

**Purchase Data Model:**
```
PurchaseCourse {
  courseId, userId
  amount, status: pending | completed | failed
  paymentId, orderId, signature
  purchasedAt
}
```

---

## Slide 12: Core Features — AI Integration

### 🤖 AI-Powered Features

**Groq API (LLaMA 3.1-8B Instant)**

The platform uses the Groq API with the **LLaMA 3.1-8B Instant** model for ultrafast AI inference:

1. **AI Course Subtitle Generator**
   - Input: Course title
   - Output: Catchy 10-word subtitle
   - Helps instructors craft compelling course titles quickly

2. **AI Course Description Generator**
   - Input: Course title
   - Output: Full HTML-formatted course description
   - Includes: Overview, Target Audience, Key Features, Career Benefits
   - Uses structured HTML with `<h2>`, `<h3>`, `<p>`, `<ul>` tags

**Google Generative AI (Gemini)**
- Additional AI-powered assistance integrated on the platform

**Impact:**
- Saves instructors hours of writing work
- Ensures professional, consistent course descriptions
- Lowers barrier to entry for new instructors

---

## Slide 13: Admin Dashboard & Analytics

### 📊 Admin Control Panel

**Dashboard Overview:**
- Total users, instructors, and students
- Total courses published
- Revenue overview with charts
- Recent activity feed

**User Management:**
- View all registered users with roles
- Approve or reject instructor applications
- Add rejection reason for declined applications
- Ban/unban users
- Promote/demote user roles

**Revenue Analytics:**
- Total platform earnings
- Revenue breakdown by course
- Instructor payout history
- Monthly/weekly revenue charts (Recharts/Chart.js)

**Instructor Reputation System:**
```
Instructor Metrics {
  reputationScore, instructorLevel
  responseRate, completionRate
  avgRating, totalStudents
}
Levels: New Instructor → Level 1 → Level 2 → Top Instructor
```

---

## Slide 14: Database Design

### 🗄️ MongoDB Data Models Overview

| Model | Purpose | Key Fields |
|---|---|---|
| **User** | All platform users | name, email, password, roles, walletBalance, enrolledCourses |
| **Course** | Course catalog | courseTitle, category, modules, creator, price, rating |
| **Module** | Course modules | title, courseId, lectures[] |
| **Lecture** | Individual lessons | title, videoUrl, duration, moduleId |
| **Resource** | Downloadable files | title, url, lectureId |
| **CourseProgress** | Student progress | userId, courseId, completedLectures, percentage |
| **PurchaseCourse** | Payment records | courseId, userId, amount, status, paymentId |
| **LiveSession** | Live classes | courseId, instructorId, scheduledAt, status, roomId |
| **ChatMessage** | Chat history | courseId, senderId, message, timestamp |
| **LiveChatMessage** | Live session chat | sessionId, senderId, message |
| **Review** | Course reviews | courseId, userId, rating, comment |

**Total Models: 11 Mongoose Schemas**

---

## Slide 15: API Architecture

### 🔗 REST API Endpoints

The backend exposes **11 modular route modules:**

| Route Module | Endpoint Prefix | Responsibility |
|---|---|---|
| `user.routes.js` | `/api/v1/user` | Auth, profile, role management |
| `course.routes.js` | `/api/v1/course` | CRUD for courses |
| `module.routes.js` | `/api/v1/module` | Module management |
| `courseProgress.routes.js` | `/api/v1/progress` | Track student progress |
| `purchaseCourse.routes.js` | `/api/payment` | Razorpay payment flows |
| `liveSession.routes.js` | `/api/v1/live` | Live session management |
| `media.routes.js` | `/api/v1/media` | File/video upload via Cloudinary |
| `resource.routes.js` | `/api/v1/resource` | Lecture resource management |
| `admin.routes.js` | `/api/v1/admin` | Admin dashboard & user control |
| `userManagement.routes.js` | `/api/v1/manage` | Advanced user management |
| `aiRoutes.routes.js` | `/api/ai` | AI subtitle/description generation |

**Authentication Middleware:**
- JWT-based token authentication
- Cookie-parser for token storage
- Role-based route protection (student/instructor/admin guards)

---

## Slide 16: Frontend Architecture

### ⚛️ React Application Structure

```
client/src/
├── App.jsx              ← Main routing (React Router)
├── main.jsx             ← App entry point + Redux Provider
├── index.css            ← Global TailwindCSS styles
├── pages/
│   ├── Login.jsx        ← Auth page (Login + Register)
│   ├── homepage.jsx     ← Landing page with hero section
│   ├── admin/           ← Admin dashboard pages
│   │   ├── Dashboard.jsx
│   │   ├── ManageUsers.jsx
│   │   ├── Revenue.jsx
│   │   ├── Wallet.jsx
│   │   ├── Reputation.jsx
│   │   └── course/      ← Course CRUD pages
│   ├── student/         ← Student-facing pages
│   │   ├── profilepage.jsx
│   │   ├── MyLearning.jsx
│   │   ├── Course.jsx
│   │   ├── Courses.jsx
│   │   ├── EnrolledCourseLectures.jsx
│   │   ├── ChatPage.jsx
│   │   ├── ExplorePage.jsx
│   │   └── BecomeInstructor.jsx
│   └── live/            ← Live session pages
├── features/
│   ├── authslice.js     ← Auth state
│   └── api/             ← RTK Query API slices (9 slices)
├── components/          ← Reusable UI components
├── layout/              ← Page layout wrappers
└── utils.js             ← Helper functions
```

**State Management with Redux Toolkit:**
- 9 dedicated RTK Query API slices for data fetching
- Auth slice for user session management
- Redux Persist for offline session continuity

---

## Slide 17: Security Implementation

### 🔐 Security Features

**Authentication & Authorization:**
- **JWT Tokens** stored in HTTP-only cookies
- Token expiry and refresh handling
- **BcryptJS** for bcrypt password hashing (industry standard)
- Role-based access control (RBAC) middleware on all protected routes

**Payment Security:**
- Razorpay **HMAC SHA-256 signature verification**
- Server-side payment validation before enrollment
- No payment data stored on our servers (PCI compliant)

**API Security:**
- CORS configuration with whitelist
- Environment variable management with dotenv
- Input validation on all API endpoints
- Rate limiting on sensitive routes

**File Upload Security:**
- Multer middleware for file type validation
- Cloudinary for secure CDN hosting
- File size limits enforced

---

## Slide 18: Key Pages & UI Features

### 🎨 User Interface Highlights

**Landing / Home Page:**
- Hero section with animated CTA buttons
- Featured courses carousel
- Category-based course browsing
- Platform statistics section
- Instructor showcase

**Student Experience:**
- Fully responsive course player with sidebar navigation
- Progress tracker and lecture checklist
- Certificate download on completion
- Calendar view for live sessions
- Course-specific real-time chat

**Instructor Experience:**
- Course builder with drag-and-drop modules
- AI content generation with one click
- Revenue analytics with interactive charts
- Live session scheduler and manager
- Reputation score dashboard

**Admin Experience:**
- Platform-wide analytics dashboard
- User management table with bulk actions
- Revenue reports and payout management
- Instructor approval workflow

---

## Slide 19: Notable Technical Achievements

### 🏆 Technical Highlights

1. **Multi-Role Identity System** — Users can hold multiple roles simultaneously and switch between them dynamically without logging out

2. **HLS Video Streaming** — Adaptive bitrate video playback ensuring smooth streaming across devices and network conditions

3. **AI Content Generation** — Integrated Groq (LLaMA 3.1) for sub-second AI response times for course subtitle and description generation

4. **Real-Time Architecture** — Dual communication channels: REST for data persistence and Socket.io for real-time events (chat + live sessions)

5. **Instructor Reputation Engine** — Automatic reputation scoring based on response rate, completion rate, average rating, and total students

6. **Wallet System** — Built-in earnings wallet for instructors with transaction history and payout request functionality

7. **Certificate Generation** — Client-side PDF certificate generation using jsPDF and html2canvas without any backend roundtrip

8. **Live Session Recording** — Automatic session recording saved to Cloudinary and convertible to course lectures

---

## Slide 20: Installation & Setup Guide

### ⚙️ How to Run the Project

**Prerequisites:**
- Node.js v18+
- MongoDB (Local or Atlas)
- Cloudinary Account
- Razorpay Account
- Groq API Key

**Step 1 — Clone the Repository**
```bash
git clone https://github.com/your-username/LMS-Mern-stack.git
cd LMS-Mern-stack
```

**Step 2 — Backend Setup**
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev   # Starts backend on http://localhost:8000
```

**Step 3 — Frontend Setup**
```bash
cd client
npm install
npm run dev   # Starts frontend on http://localhost:5173
```

---

## Slide 21: Project Statistics

### 📈 Codebase Metrics

| Metric | Value |
|---|---|
| **Total Files** | 100+ source files |
| **Frontend Pages** | 20+ pages and views |
| **Backend Controllers** | 9 controller modules |
| **API Route Modules** | 11 route files |
| **Database Models** | 11 Mongoose schemas |
| **Redux API Slices** | 9 RTK Query slices |
| **Tech Dependencies** | 30+ npm packages |
| **Supported Roles** | 3 (Student, Instructor, Admin) |
| **AI Models Used** | 2 (LLaMA 3.1, Gemini) |
| **Real-time Events** | Socket.io WebSocket |

---

## Slide 22: Future Enhancements

### 🚀 Planned Future Features

1. **Mobile App** — React Native version for iOS and Android
2. **AI Quiz Generator** — Auto-generate MCQ quizzes from lecture content
3. **Gamification** — Badges, leaderboards, and streak tracking
4. **Subtitles & Captions** — AI-generated video subtitles
5. **Multi-language Support** — i18n for global reach
6. **Course Bundles** — Bundle multiple courses at discounted rates
7. **Affiliate System** — Referral tracking and commission management
8. **Advanced Analytics** — Heatmaps, watch-time analytics for instructors
9. **Push Notifications** — Browser and email notifications
10. **OAuth Login** — Google and GitHub single sign-on

---

## Slide 23: Challenges & Solutions

### 🧩 Key Challenges Faced

| Challenge | Solution |
|---|---|
| Role-based access with multi-role users | Implemented `roles[]` array + `activeRole` field with pre-validate hook |
| Real-time chat with message persistence | Combined Socket.io for delivery + MongoDB for storage |
| Secure payment verification | Server-side Razorpay HMAC signature validation |
| AI response speed for course generation | Used Groq's LLaMA 3.1 8B for ultra-fast inference |
| Video streaming on slow connections | HLS adaptive bitrate streaming via Cloudinary |
| Instructor application workflow | Admin approval pipeline with status enum and rejection reasons |
| Live session room management | crypto.randomBytes for unique room IDs + Socket.io rooms |

---

## Slide 24: Conclusion

### ✅ What We Achieved

✔ **Full-Stack MERN Application** — Production-ready codebase with 100+ files  
✔ **AI Integration** — Groq + Gemini for smart content generation  
✔ **Real-Time Features** — Chat and live sessions via Socket.io  
✔ **Secure Payments** — Complete Razorpay integration with webhook verification  
✔ **Multi-Role System** — Dynamic role management for 3 user types  
✔ **Video Streaming** — HLS adaptive video with Cloudinary CDN  
✔ **Analytics Dashboards** — Charts and KPIs for Admin and Instructor  
✔ **Certificate System** — PDF certificate generation on completion  
✔ **Instructor Reputation Engine** — Automated scoring and ranking  
✔ **Responsive Design** — Mobile-first UI with TailwindCSS

---

### 🙏 Thank You!

**LearnGPT — Empowering Education Through Technology**

> *"The beautiful thing about learning is that no one can take it away from you."*
> — B.B. King

---

*Presented by: [Your Name]*  
*Project: LearnGPT — AI-Powered LMS*  
*Tech Stack: MongoDB | Express.js | React | Node.js*

---

## Appendix: Quick Reference

### User Flow Diagrams

**Student Flow:**
```
Register → Browse Courses → Purchase → Watch Lectures → 
Track Progress → Join Live Sessions → Chat → Get Certificate
```

**Instructor Flow:**
```
Register → Apply as Instructor → Admin Approves → 
Create Course → Upload Lectures → Publish → 
Schedule Live Sessions → Earn Revenue → Withdraw
```

**Admin Flow:**
```
Login → View Dashboard → Manage Users → 
Approve Instructors → Monitor Revenue → 
Handle Payouts → View Reports
```

### API Quick Reference

| Action | Method | Route |
|---|---|---|
| Register User | POST | `/api/v1/user/register` |
| Login | POST | `/api/v1/user/login` |
| Get All Courses | GET | `/api/v1/course` |
| Create Course | POST | `/api/v1/course` |
| Purchase Course | POST | `/api/payment/checkout` |
| Verify Payment | POST | `/api/payment/verify` |
| Get Progress | GET | `/api/v1/progress/:courseId` |
| Schedule Live Session | POST | `/api/v1/live` |
| Generate AI Subtitle | POST | `/api/ai/subtitle` |
| Generate AI Description | POST | `/api/ai/description` |
| Admin: Get All Users | GET | `/api/v1/admin/users` |
| Admin: Approve Instructor | PUT | `/api/v1/admin/approve-instructor` |
