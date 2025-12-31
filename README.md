# 🎓 LMS Platform (LearnGPT)

A comprehensive Learning Management System (LMS) built with the MERN stack (MongoDB, Express.js, React, Node.js). This platform allows instructors to create and manage courses, students to enroll and track progress, and features real-time chat and AI-powered assistance.

## 🚀 Features

-   **User Authentication**: Secure login and registration for Students and Instructors.
-   **Course Management**: Create, edit, and delete courses (curriculum, videos, resources).
-   **Video Streaming**: Adaptive video playback with HLS support.
-   **Payment Integration**: Secure payments via Razorpay.
-   **Real-time Chat**: Course-specific chat rooms powered by Socket.io.
-   **AI Integration**: AI-powered features using Google Gemini.
-   **Dashboard**: Comprehensive analytics and progress tracking for users.
-   **Rich Text Editor**: Integrated TipTap editor for course content creation.
-   **Responsive Design**: Fully responsive UI built with TailwindCSS and Headless UI.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React (Vite)
-   **State Management**: Redux Toolkit, Redux Persist
-   **Styling**: TailwindCSS, Headless UI, Radix UI, Framer Motion
-   **HTTP Client**: Axios
-   **Real-time**: Socket.io-client
-   **Charts**: Recharts, Chart.js

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Authentication**: JWT (JSON Web Tokens), BcryptJS
-   **File Storage**: Cloudinary
-   **AI**: Google Generative AI (Gemini)
-   **Payments**: Razorpay
-   **Real-time**: Socket.io

## ⚙️ Installation & Setup

### Prerequisites
-   Node.js (v18 or higher recommended)
-   MongoDB (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/LMS-Mern-stack.git
cd LMS-Mern-stack
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the client directory and install dependencies:
```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

## 📂 Project Structure

```
LMS-Mern-stack/
├── client/                 # Frontend React Application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages/views
│   │   ├── redux/          # Redux state slices and store
│   │   ├── utils/          # Helper functions
│   │   └── ...
│   └── ...
├── server/                 # Backend Node.js Application
│   ├── config/             # Configuration files
│   ├── controllers/        # Route logic
│   ├── db/                 # Database connection
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── ...
└── README.md
```

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## 📄 License
This project is licensed under the ISC License.
