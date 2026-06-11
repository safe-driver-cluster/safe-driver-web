import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"
import { getDatabase, Database } from "firebase/database"
import { getStorage, FirebaseStorage } from "firebase/storage"
import type { Messaging } from "firebase/messaging"
import type { Analytics } from "firebase/analytics"

// Firebase configuration - use environment variables if available, otherwise use defaults
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBhjbnNGQcGllHwGal2NIUPTAstnUlSwaw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "safe-driver-system.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://safe-driver-system-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "safe-driver-system",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "safe-driver-system.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "719842751658",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:719842751658:web:6a6741fea6402a70514cd3",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-EVL44XM90H"
}

// Initialize Firebase
let app: FirebaseApp | undefined
let auth: Auth | undefined
let firestore: Firestore | undefined
let database: Database | undefined
let storage: FirebaseStorage | undefined
let messaging: Messaging | undefined
let analytics: Analytics | undefined

// Legacy exports for backward compatibility
let db: Firestore | undefined

export const initializeFirebase = (): {
  app: FirebaseApp
  auth: Auth
  firestore: Firestore
  database: Database
  storage: FirebaseStorage
  messaging: Messaging | null
  analytics: Analytics | null
} => {
  // Return existing instances if already initialized
  if (app && auth && firestore && database && storage) {
    return {
      app,
      auth,
      firestore,
      database,
      storage,
      messaging: messaging || null,
      analytics: analytics || null,
    }
  }

  // Check if Firebase is already initialized
  const existingApps = getApps()
  if (existingApps.length > 0) {
    app = existingApps[0]
  } else {
    app = initializeApp(firebaseConfig)
  }

  // Initialize services
  auth = getAuth(app)
  firestore = getFirestore(app)
  database = getDatabase(app)
  storage = getStorage(app)
  
  // Set legacy db for backward compatibility
  db = firestore

  // Check if Firebase is properly configured
  if (typeof window !== "undefined" && (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your-api-key")) {
    console.warn("⚠️ Firebase API key not configured. Please set NEXT_PUBLIC_FIREBASE_API_KEY in .env.local")
  }

  // Note: messaging and analytics are initialized lazily when requested
  // to avoid server-side import issues

  return {
    app,
    auth,
    firestore,
    database,
    storage,
    messaging: messaging || null,
    analytics: analytics || null,
  }
}

// Get Firebase services (lazy initialization)
export const getFirebaseServices = () => {
  if (!app || !auth || !firestore || !database || !storage) {
    return initializeFirebase()
  }

  return {
    app,
    auth,
    firestore,
    database,
    storage,
    messaging: messaging || null,
    analytics: analytics || null,
  }
}

// Export individual service getters
export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    const services = initializeFirebase()
    return services.app
  }
  return app
}

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    const services = initializeFirebase()
    return services.auth
  }
  return auth
}

export const getFirebaseFirestore = (): Firestore => {
  if (!firestore) {
    const services = initializeFirebase()
    return services.firestore
  }
  return firestore
}

export const getFirebaseDatabase = (): Database => {
  if (!database) {
    const services = initializeFirebase()
    return services.database
  }
  return database
}

export const getFirebaseStorage = (): FirebaseStorage => {
  if (!storage) {
    const services = initializeFirebase()
    return services.storage
  }
  return storage
}

// Initialize messaging (browser only, call this explicitly when needed)
export const initializeMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === "undefined") {
    return null
  }
  if (messaging) {
    return messaging
  }
  if (!app) {
    initializeFirebase()
  }
  if (!app) return null
  
  try {
    const messagingModule = await import("firebase/messaging")
    messaging = messagingModule.getMessaging(app)
    return messaging
  } catch (error) {
    console.warn("Firebase Cloud Messaging is not available:", error)
    return null
  }
}

// Initialize analytics (browser only, call this explicitly when needed)
export const initializeAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") {
    return null
  }
  if (analytics) {
    return analytics
  }
  if (!app) {
    initializeFirebase()
  }
  if (!app) return null
  
  try {
    const analyticsModule = await import("firebase/analytics")
    analytics = analyticsModule.getAnalytics(app) as Analytics
    return analytics
  } catch (error) {
    console.warn("Firebase Analytics is not available:", error)
    return null
  }
}

export const getFirebaseMessaging = (): Messaging | null => {
  if (typeof window === "undefined") {
    return null
  }
  return messaging || null
}

export const getFirebaseAnalytics = (): Analytics | null => {
  if (typeof window === "undefined") {
    return null
  }
  return analytics || null
}

// Legacy exports for backward compatibility
export { app, db, auth, storage }
export default app

// Note: Firebase is initialized lazily when services are accessed
// Do not initialize on module load to avoid issues with server-side rendering
