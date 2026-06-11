# Firebase Setup Guide

This project uses Firebase for backend services including authentication, Firestore database, Realtime Database, Storage, Cloud Messaging, and Analytics.

## Configuration

Firebase is configured directly in `lib/firebase/config.ts` with the project credentials. The configuration connects to the production Firebase project: **safe-driver-system**.

## Services Available

The following Firebase services are initialized and available:

- **Authentication** - User authentication and management
- **Firestore** - NoSQL document database
- **Realtime Database** - Real-time synchronized database
- **Storage** - File storage service
- **Cloud Messaging** - Push notifications
- **Analytics** - User analytics and tracking

## Usage

Import Firebase services in your components:

```typescript
// Authentication
import { getFirebaseAuth } from "@/lib/firebase/config"
const auth = getFirebaseAuth()

// Firestore
import { getFirebaseFirestore } from "@/lib/firebase/config"
const firestore = getFirebaseFirestore()

// Realtime Database
import { getFirebaseDatabase } from "@/lib/firebase/config"
const database = getFirebaseDatabase()

// Storage
import { getFirebaseStorage } from "@/lib/firebase/config"
const storage = getFirebaseStorage()

// Messaging (browser only)
import { getFirebaseMessaging } from "@/lib/firebase/config"
const messaging = getFirebaseMessaging()

// Analytics (browser only)
import { getFirebaseAnalytics } from "@/lib/firebase/config"
const analytics = getFirebaseAnalytics()
```

Or use the service wrappers:

```typescript
// Authentication
import { authService } from "@/lib/firebase"
const user = await authService.signIn("email@example.com", "password")

// Firestore
import { firestoreService } from "@/lib/firebase"
const users = await firestoreService.getCollection("users")

// Realtime Database
import { realtimeDbService } from "@/lib/firebase"
realtimeDbService.set("users/123", { name: "John" })

// Storage
import { storageService } from "@/lib/firebase"
const url = await storageService.uploadFile("images/photo.jpg", file)
```

## Firebase Configuration Files

The project includes the following Firebase configuration files:

- `firebase.json` - Deployment configuration
- `.firebaserc` - Firebase project configuration
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore index definitions
- `database.rules.json` - Realtime Database security rules
- `storage.rules` - Storage security rules

## Security Rules

Make sure to set up proper security rules for production:

- **Firestore**: Set up rules in Firestore Database > Rules
- **Realtime Database**: Set up rules in Realtime Database > Rules
- **Storage**: Set up rules in Storage > Rules

## Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Realtime Database](https://firebase.google.com/docs/database)
- [Cloud Storage](https://firebase.google.com/docs/storage)
- [Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Analytics](https://firebase.google.com/docs/analytics)
