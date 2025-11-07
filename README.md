# rePawsitory 🐾

A comprehensive pet health management system that enables pet owners to track their pets' health records and securely share them with veterinarians.

## Quick Start

### 1. Setup Backend

```bash
cd pet-health-backend
npm install
# Create .env file (see below)
npm start
```

### 2. Setup Frontend

```bash
cd pet-health-frontend
npm install
npm start
```

### 3. Environment Variables

Create `pet-health-backend/.env`:

```env
PORT=5001
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/repawsitory
JWT_SECRET=your-secret-key-here
```

## Features

- 👤 **User Authentication** - Separate accounts for pet owners and veterinarians
- 🐕 **Pet Management** - Add, edit, and track multiple pets with photos
- 📋 **Medical Records** - Complete health history with file attachments
- 🔐 **Access Control** - Grant/revoke veterinarian access to pet records
- ✅ **Profile Completion** - Enforced profile setup before adding pets
- 🎨 **Modern UI** - Clean, responsive interface built with Tailwind CSS

## Technologies

- **Frontend:** React, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **File Upload:** Multer

## Default Port Configuration

- Backend API: `http://localhost:5001`
- Frontend App: `http://localhost:3000`

## Project Structure

```
rePawsitory/
├── pet-health-backend/      # Node.js API server
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   └── uploads/            # File storage
│
└── pet-health-frontend/    # React application
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Main application pages
    │   └── hooks/          # Custom React hooks
    └── public/
```

## Documentation

- **Setup Guide:** See `MONGODB_ATLAS_SETUP.md` for cloud database setup
- **Submission Guide:** See `SUBMISSION_GUIDE.md` for complete project documentation

## User Roles

### Pet Owner
- Add and manage pets
- View all medical records
- Grant access to veterinarians
- Cannot modify medical records

### Veterinarian
- View assigned patients
- Add medical records with attachments
- Edit/delete only their own records
- View records from other veterinarians

## License

Educational project for academic purposes.

---

Made with ❤️ for pet health management
