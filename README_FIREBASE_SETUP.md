# Firebase Setup Guide

## Quick Setup

1. **Get your Firebase configuration:**
   - Go to [Firebase Console](https://console.firebase.google.com/project/safe-driver-system/settings/general)
   - Select your project: `safe-driver-system`
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the Web app (or create one if it doesn't exist)
   - Copy the Firebase configuration

2. **Create `.env.local` file in the project root:**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=safe-driver-system.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=safe-driver-system
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=safe-driver-system.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

3. **Set up Firestore Database:**
   - Go to [Firestore Database](https://console.firebase.google.com/project/safe-driver-system/firestore)
   - Create database if not exists
   - Start in **production mode** (or test mode for development)
   - Set your location (e.g., us-central1)

4. **Set up Firestore Security Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /vehicles/{vehicleId} {
         allow read, write: if true; // For development - restrict in production
       }
     }
   }
   ```

5. **Restart your dev server:**
   ```bash
   npm run dev
   ```

## Troubleshooting

- **Check browser console** for Firebase initialization errors
- **Verify environment variables** are loaded (check Network tab for API calls)
- **Check Firestore rules** allow read/write operations
- **Verify collection name** matches: `vehicles`

## Testing

After setup, try adding a vehicle in the Fleet Management page. Check the browser console for:
- ✅ "Firebase initialized with project: safe-driver-system"
- ✅ "Vehicle added successfully with ID: ..."
- Check Firestore console to see the new document

