# ParkEase — Smart Parking Lot Finder

A premium full-stack web application designed to help users search, explore, and reserve parking slots in real time. Features interactive map search, real-time vacancy tracking, simulated card checkout, Google OAuth sign-in, and an intent-based AI chatbot assistant.

Built as a capstone project for the **Entri Full-Stack Web Development Program**.

---

## 🎨 Core Features

- **Interactive Leaflet.js Map**: Premium dark-mode themed map populated with color-coded live spot indicators.
- **Geospatial Proximity Sorting**: Geolocation integration to automatically identify and sort nearby parking plazas.
- **Interactive Floor Grid Model**: Visual layout grid separating Standard, SUV, Handicap, and EV charger slots.
- **Razorpay Sandbox Simulator**: Checkout forms with CVV/expiration masked inputs and card processing loading states.
- **Secure Google OAuth Login**: Quick one-tap registration using Google Identity Services.
- **Operations Admin Dashboard**: CRUD models, roles configuration, booking logs, and gross revenue aggregates.
- **AI Chat Assistant Widget**: Floating dialog bubble querying vacant slots and pricing naturally via Express proxy.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS v3, React Router v6, react-leaflet |
| **Backend** | Node.js, Express.js, JWT Authentication (Passport style API flow) |
| **Database** | MongoDB Atlas, Mongoose ODM (with GeoJSON geospatial indexes) |
| **Design** | HSL Curated Slate palettes, Glassmorphism card overlays, Lucide Icons |

---

## 📁 Repository Structure

```
parking-lot-finder/
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/              # UI Component Blocks
│   │   ├── contexts/                # AuthContext (Google Identity)
│   │   ├── hooks/                   # Custom Geolocation & Booking hooks
│   │   ├── pages/                   # Main Page Views
│   │   ├── services/                # Axios API connection endpoints
│   │   └── utils/                   # Constant definitions & helper formulas
│   ├── tailwind.config.js           # Custom Indigo theme & Animations
│   └── package.json
│
└── server/                          # Express.js Backend
    ├── config/                      # Database & Env configurations
    ├── controllers/                 # Business logic handlers
    ├── middleware/                  # JWT protectors & validations
    ├── models/                      # User, ParkingLot, Booking & Review schemas
    ├── routes/                      # API endpoints mounting
    ├── utils/                       # Token builders & seed data script
    └── server.js                    # Express app entry point
```

---

## 🚀 Local Installation & Configuration

### Prerequisites
- **Node.js** (v20+ recommended)
- **MongoDB Atlas Connection**
- **Google Cloud Console Project** (OAuth Client ID)

---

### Step 1: Clone & Install Dependencies
From the root directory of the project, run:

```bash
# Install root concurrency tools
npm install

# Install both Client and Server dependencies in a single shot
npm run install-all
```

---

### Step 2: Configure Environment Variables

#### Backend Server Config
Create a `.env` file in the `server/` directory:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas link
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/parkease?retryWrites=true&w=majority

# Access & Refresh Secrets (Generate a strong random string)
JWT_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Google Credentials (from Cloud Console API Credentials)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# CORS origin
CLIENT_URL=http://localhost:5173
```

#### Frontend Client Config
Create a `.env` file in the `client/` directory:

```env
# Google OAuth Client ID matching the backend credentials
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

---

### Step 3: Seed Database Assets
Populate MongoDB with 18 realistic parking lot facilities across Kochi, Thiruvananthapuram, Kozhikode, Bangalore, and Chennai:

```bash
npm run seed
```

---

### Step 4: Run Concurrent Dev Servers
Launch both the Vite React application and the Express API server concurrently:

```bash
npm run dev
```

The application will launch at:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## ⚡ Deployment Recommendations

### Frontend (Vercel / Netlify)
1. Set the root directory to `client`.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Configure the environment variable `VITE_GOOGLE_CLIENT_ID`.

### Backend (Render / Railway)
1. Set the root directory to `server`.
2. Set the build command to `npm install`.
3. Set the start command to `node server.js`.
4. Configure all environment variables listed in `server/.env`.
