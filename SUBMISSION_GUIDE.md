# rePawsitory - Project Submission Guide

## Project Overview

**rePawsitory** is a comprehensive pet health management system that allows pet owners to track their pets' health records and share access with veterinarians.

## Features

- ✅ User authentication (Pet Owners & Veterinarians)
- ✅ Pet profile management with photos
- ✅ Medical records management with file attachments
- ✅ Access control system for sharing pet data with vets
- ✅ Role-based permissions
- ✅ Profile completion enforcement
- ✅ Responsive UI with Tailwind CSS

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcrypt** for password hashing

### Frontend
- **React** (Create React App)
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation

## Project Structure

```
rePawsitory/
├── pet-health-backend/          # Backend API
│   ├── models/                  # Database models
│   │   ├── User.js
│   │   ├── Pet.js
│   │   ├── MedicalRecord.js
│   │   └── PetAccess.js
│   ├── routes/                  # API routes
│   │   └── auth.js
│   ├── middleware/              # Express middleware
│   │   └── auth.js
│   ├── uploads/                 # Uploaded files
│   ├── server.js               # Main server file
│   ├── db.js                   # Database connection
│   ├── package.json
│   └── .env                    # Environment variables
│
└── pet-health-frontend/         # Frontend React App
    ├── public/
    │   └── logo.png            # App logo
    ├── src/
    │   ├── components/         # Reusable components
    │   │   ├── AddPetModal.jsx
    │   │   ├── EditPetModal.jsx
    │   │   ├── AddRecordModal.jsx
    │   │   ├── ViewRecordModal.jsx
    │   │   └── layout/
    │   │       ├── Header.jsx
    │   │       ├── Sidebar.jsx
    │   │       └── Layout.jsx
    │   ├── hooks/              # Custom React hooks
    │   │   ├── usePets.js
    │   │   ├── usePatients.js
    │   │   └── useNavigation.js
    │   ├── pages/              # Main pages
    │   │   ├── PetHealthApp.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── PetsPage.jsx
    │   │   ├── PatientsPage.jsx
    │   │   ├── PetRecordsPage.jsx
    │   │   ├── SharingPage.jsx
    │   │   ├── RecordsPage.jsx
    │   │   └── SettingsPage.jsx
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── tailwind.config.js
```

## Setup Instructions for Professor

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- Internet connection (for MongoDB Atlas)

### Step 1: Extract the Project
1. Unzip the `rePawsitory.zip` file
2. Open terminal/command prompt

### Step 2: Backend Setup

```powershell
# Navigate to backend folder
cd rePawsitory/pet-health-backend

# Install dependencies
npm install

# Create .env file with the following content:
# (MongoDB Atlas credentials will be provided separately)
PORT=5001
MONGO_URI=<PROVIDED_MONGODB_ATLAS_CONNECTION_STRING>
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Start the backend server
npm start
```

The backend should now be running on `http://localhost:5001`

### Step 3: Frontend Setup

Open a **new terminal window**:

```powershell
# Navigate to frontend folder
cd rePawsitory/pet-health-frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend should automatically open in your browser at `http://localhost:3000`

### Step 4: Access the Application

1. Open your browser to `http://localhost:3000`
2. You can:
   - **Create new accounts** using the signup page
   - **Use test accounts** (credentials provided separately)

## Test Accounts

### Pet Owner Account
- Email: `owner@test.com`
- Password: `password123`

### Veterinarian Account
- Email: `vet@test.com`
- Password: `password123`

## User Guide

### For Pet Owners:

1. **Sign up** with email and complete profile (phone & address required)
2. **Add pets** with details and photos
3. **Grant access** to veterinarians via the Sharing page
4. **View medical records** added by veterinarians
5. **Edit pet information** (but cannot modify medical records)

### For Veterinarians:

1. **Sign up** as veterinarian with clinic details
2. **View patients** - pets that owners have granted you access to
3. **Add medical records** with attachments (PDF or images required)
4. **Edit/delete** only the medical records you created
5. **View all records** for your patients (including those from other vets)

## Key Features Demonstrated

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (Pet Owner vs Veterinarian)
- Protected routes and API endpoints

### 2. Profile Completion System
- Users must complete their profile before adding pets
- Non-dismissible warnings on Dashboard and Pets pages
- Automatic profile completion status checking

### 3. Access Control
- Pet owners can grant/revoke veterinarian access
- Granular permissions (view medical history, add records)
- Secure data sharing between users

### 4. Medical Records Management
- File upload support (PDF and images)
- Required attachments for medical records
- Veterinarian automatically recorded for each record
- Edit/delete restricted to record creator only

### 5. Responsive UI
- Clean, modern interface with Tailwind CSS
- Mobile-friendly design
- User-friendly forms and modals

## Database Schema

### User
- Authentication details (email, password)
- Profile information (name, phone, address)
- Role (pet_owner or veterinarian)
- Vet-specific fields (clinic, license, specialization)

### Pet
- Owner reference
- Basic info (name, species, breed, age, gender, weight)
- Health info (allergies, chronic conditions, microchip ID)
- Photo upload

### MedicalRecord
- Pet reference
- Record type (vaccination, medication, checkup, surgery)
- Date, veterinarian, notes
- File attachments (required)
- Cost tracking
- Creator/updater tracking

### PetAccess
- Pet owner grants access to specific veterinarian
- Permissions (view medical history, add records)
- Revocation support

## API Endpoints

### Authentication
- `POST /api/register` - Create new user account
- `POST /api/login` - Login and get JWT token

### User Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile/update` - Update user profile

### Pets
- `GET /pets` - Get user's pets
- `POST /pets` - Create new pet (requires complete profile)
- `PUT /pets/:id` - Update pet
- `DELETE /pets/:id` - Delete pet

### Medical Records
- `GET /api/pets/:petId/medical-records` - Get pet's medical records
- `POST /api/medical-records` - Create medical record (vets only)
- `PUT /api/medical-records/:id` - Update medical record (creator only)
- `DELETE /api/medical-records/:id` - Delete medical record (creator only)

### Access Control
- `GET /api/vets` - Search veterinarians
- `POST /api/pet-access/grant` - Grant vet access to pet
- `GET /api/pet-access/my-grants` - Get granted access list
- `PUT /api/pet-access/revoke/:accessId` - Revoke vet access

### File Uploads
- `POST /api/upload/pet` - Upload pet photo
- `POST /api/upload/medical-record` - Upload medical record files

## Security Features

1. **Password Hashing** - bcrypt with salt rounds
2. **JWT Authentication** - Secure token-based auth
3. **Protected Routes** - All sensitive endpoints require authentication
4. **Role-Based Access** - Different permissions for owners vs vets
5. **Data Validation** - Input validation on both frontend and backend
6. **Profile Completion Enforcement** - Users must complete profile before adding pets

## Known Limitations

1. File storage is local (in production, would use cloud storage like AWS S3)
2. Email verification not implemented
3. Password reset functionality not included
4. No real-time notifications

## Troubleshooting

### Backend won't start
- Check if MongoDB Atlas connection string is correct in `.env`
- Verify all dependencies are installed: `npm install`
- Check if port 5001 is available

### Frontend won't start
- Verify all dependencies are installed: `npm install`
- Check if port 3000 is available
- Clear npm cache: `npm cache clean --force`

### Cannot connect to database
- Check internet connection
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Confirm connection string credentials are correct

### Images not displaying
- Check if backend server is running on port 5001
- Verify uploads folder exists in backend directory

## Contact Information

For any questions or issues, please contact:
[Your Name]
[Your Email]
[Your Student ID]

---

**Submission Date:** [Date]
**Course:** [Course Name/Code]
**Professor:** [Professor Name]
