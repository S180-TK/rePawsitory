# MongoDB Atlas Credentials for rePawsitory

## IMPORTANT: Please fill in the bracketed sections with your actual credentials

---

## MongoDB Atlas Account Information

**Atlas Login Email:** [your-email@example.com]  
**Atlas Login Password:** [your-atlas-account-password]

## Database Connection Information

**Database Username:** repawsitory_admin  
**Database Password:** [your-database-password]  
**Database Name:** repawsitory

**Full Connection String:**
```
mongodb+srv://repawsitory_admin:[YOUR_PASSWORD]@cluster0.[XXXXX].mongodb.net/repawsitory?retryWrites=true&w=majority
```

Replace `[YOUR_PASSWORD]` with the actual database password  
Replace `[XXXXX]` with your cluster identifier (e.g., abc123)

## How Professor Can Access the Database

### Option 1: Through MongoDB Atlas Web Interface
1. Visit: https://account.mongodb.com/
2. Login with Atlas email and password above
3. Click "Database" in left sidebar
4. Click "Browse Collections" button
5. You can now view all data in the database

### Option 2: Using MongoDB Compass (Desktop App)
1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Open Compass
3. Paste the connection string above (with password filled in)
4. Click "Connect"
5. Browse the `repawsitory` database

## Test Accounts Created in the Application

### Pet Owner Account
- **Email:** owner@test.com
- **Password:** password123
- **Profile:** John Doe, with 2 sample pets

### Veterinarian Account
- **Email:** vet@test.com
- **Password:** password123
- **Profile:** Dr. Sarah Smith, City Veterinary Clinic

### Additional Test Account (Optional)
- **Email:** [add if you created more]
- **Password:** [password]
- **Role:** [Pet Owner / Veterinarian]

## Sample Data Included

- ✅ 2 Pet profiles with photos
- ✅ 3 Medical records with attachments
- ✅ 1 Active access grant between pet owner and vet

## Collections in Database

The following collections contain data:

1. **users** - User accounts (pet owners and veterinarians)
2. **pets** - Pet profiles and information
3. **medicalrecords** - Health records with file attachments
4. **petaccesses** - Access permissions between owners and vets

## Notes for Professor

- The database is hosted on MongoDB Atlas (cloud)
- Data will persist even when local servers are stopped
- All uploaded files (pet photos, medical records) are stored locally in the backend/uploads folder
- The connection allows access from any IP address (0.0.0.0/0) for easy testing

## Support

If you encounter any issues accessing the database:
1. Verify the connection string is copied correctly
2. Check that the password has no typos
3. Ensure you have internet connectivity
4. Contact me at: [your-email@example.com]

---

**Prepared by:** [Your Name]  
**Student ID:** [Your ID]  
**Date:** [Today's Date]  
**Course:** [Course Name/Code]
