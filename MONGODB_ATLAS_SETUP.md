# MongoDB Atlas Setup Guide for rePawsitory

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email or Google account
3. Choose the **FREE tier** (M0 Sandbox - 512MB storage)

## Step 2: Create a Cluster

1. After logging in, click **"Build a Database"**
2. Choose **FREE** tier (M0)
3. Choose a cloud provider and region (preferably closest to you):
   - **AWS** or **Google Cloud**
   - Region: Choose one close to your location (e.g., Singapore, Tokyo, etc.)
4. Name your cluster (default "Cluster0" is fine)
5. Click **"Create"**
6. Wait 3-5 minutes for the cluster to be created

## Step 3: Create Database User

1. You'll see a "Security Quickstart" screen
2. Under **"How would you like to authenticate your connection?"**
   - Choose **"Username and Password"**
   - Username: `repawsitory_admin` (or any name you prefer)
   - Password: Click "Autogenerate Secure Password" or create your own
   - **IMPORTANT: Copy and save this password somewhere safe!**
3. Click **"Create User"**

## Step 4: Configure Network Access

1. Under **"Where would you like to connect from?"**
   - Choose **"My Local Environment"**
   - Click **"Add My Current IP Address"**
   - For easier access during submission, you can also add `0.0.0.0/0` (allows access from anywhere)
     - Click **"Add IP Address"**
     - Enter `0.0.0.0/0` in the IP Address field
     - Description: "Allow access from anywhere"
     - Click **"Add Entry"**
2. Click **"Finish and Close"**

## Step 5: Get Your Connection String

1. On the main dashboard, click **"Connect"** on your cluster
2. Choose **"Drivers"**
3. Select:
   - Driver: **Node.js**
   - Version: **5.5 or later**
4. Copy the connection string that looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your actual password
7. Add the database name after `.net/`:
   ```
   mongodb+srv://repawsitory_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/repawsitory?retryWrites=true&w=majority
   ```

## Step 6: Update Your Project

1. Open `pet-health-backend/.env` file
2. Replace the `MONGO_URI` line with your Atlas connection string:
   ```
   MONGO_URI=mongodb+srv://repawsitory_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/repawsitory?retryWrites=true&w=majority
   ```

## Step 7: Test the Connection

1. Stop your backend server if it's running
2. Start it again:
   ```powershell
   cd pet-health-backend
   npm start
   ```
3. You should see: "Connected to MongoDB Atlas" or similar message
4. Your application should now work with the cloud database!

## Step 8: Seed Your Database (Optional)

If you want to include sample data for your professor:

1. Create test accounts by using your frontend signup
2. Add some sample pets and medical records
3. Grant access between vets and pet owners

## For Submission

### What to Include:

1. **Zipped Project Code** - The entire project folder
2. **MongoDB Atlas Credentials Document** with:
   - Atlas account email
   - Database username
   - Database password
   - Connection string
   - Instructions on how to access

3. **README.md** with:
   - Setup instructions
   - How to run the project
   - Default test accounts (if any)

### Sample Credentials Document:

```
MONGODB ATLAS CREDENTIALS FOR rePawsitory
==========================================

Atlas Account Email: your-email@example.com
Database Username: repawsitory_admin
Database Password: [YOUR_PASSWORD_HERE]

Connection String:
mongodb+srv://repawsitory_admin:[PASSWORD]@cluster0.xxxxx.mongodb.net/repawsitory?retryWrites=true&w=majority

How to Access:
1. Log in to MongoDB Atlas at https://account.mongodb.com/
2. Email: your-email@example.com
3. Password: [YOUR_ATLAS_LOGIN_PASSWORD]
4. Navigate to "Database" -> "Browse Collections" to view data

Test Accounts Created:
- Pet Owner: owner@test.com / password123
- Veterinarian: vet@test.com / password123
```

## Troubleshooting

### Connection Timeout
- Make sure you added `0.0.0.0/0` to IP whitelist
- Check if your connection string is correct

### Authentication Failed
- Verify username and password are correct
- Make sure you're using the database user credentials, not your Atlas login

### Cannot Connect
- Check your internet connection
- Verify the cluster is running (green status in Atlas dashboard)

## Benefits of MongoDB Atlas

✅ **Free tier available** - Perfect for student projects
✅ **No local installation needed** - Your professor can access it easily
✅ **Cloud-based** - Works from anywhere with internet
✅ **Easy to share** - Just provide credentials
✅ **Persistent data** - Data stays even when your computer is off
