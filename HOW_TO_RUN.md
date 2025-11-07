# How to Run rePawsitory

What you need:
- Node.js installed (get it from nodejs.org)
- Internet connection

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
- Pet Owner: allan@gmail.com / 33333333
- Veterinarian: juana@gmail.com / 44444444

Or click "Create Account" to make a new one.


---------------------------------------------------------------------------

To stop: Press Ctrl+C in both windows.


That's it! 🎉
