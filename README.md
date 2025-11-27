# How to Run rePawsitory

What you need:
- Node.js installed (get it from nodejs.org)
- Internet connection

**Note:** The database is hosted in the cloud (MongoDB Atlas) and is already configured in the project. No local database setup is required!

---------------------------------------------------------------------------

## Environment Configuration

**URLs used in this project:**

**Database:**
- MongoDB Atlas: `mongodb+srv://rovickdompor_db_user:A559PoD0zfz6N2rr@cluster0.mizhw2z.mongodb.net/`

**Backend API:**
- Local: `http://localhost:5001`
- Deployed (Render): `https://repawsitory.onrender.com`

**Frontend:**
- Local: `http://localhost:3000`
- Deployed (Vercel): `https://repawsitory.vercel.app` (or your actual Vercel URL)

**Environment Variables:**
- Backend: No `.env` file needed (MongoDB URI is hardcoded for simplicity)
- Frontend `.env` (optional for local development):
  ```
  REACT_APP_API_URL=http://localhost:5001
  ```
  Note: Comment this out for production deployment

---------------------------------------------------------------------------

STEP 1: Extract the project

Unzip the file to any folder.

---------------------------------------------------------------------------

STEP 2: Start the backend

Open Command Prompt or Terminal, then run these commands:

cd rePawsitory/pet-health-backend
npm install
npx nodemon server.js

(If nodemon doesn't work, use "npm start" instead)

You should see "Server running on port 5001" and "Connected to MongoDB".
Keep this window open.

---------------------------------------------------------------------------

STEP 3: Start the frontend

Open another Command Prompt or Terminal window, then run:

cd rePawsitory/pet-health-frontend
npm install
npm start

Your browser should open automatically to http://localhost:3000
Keep this window open too.

---------------------------------------------------------------------------

STEP 4: Login to the app

Test accounts:
- Pet Owner: axl@gmail.com / Sample123
- Veterinarian: a.patriana@gmail.com / Patriana10
- Admin: admin@gmail.com /  Sample11

Or click "Create Account" to make a new one.

---------------------------------------------------------------------------

## Deployed Application

The application is also deployed online:
- Frontend: https://repawsitory.vercel.app (Vercel)
- Backend: https://repawsitory.onrender.com (Render)

**Important Note:** Due to Render's free tier limitations, uploaded images (pet photos) are temporary and will be deleted when the backend server restarts or redeploys. For best experience with image uploads, run the application locally.

---------------------------------------------------------------------------

To stop: Press Ctrl+C in both windows.

