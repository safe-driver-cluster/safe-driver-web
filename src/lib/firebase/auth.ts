import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
} from "firebase/auth"
import { getFirebaseAuth } from "./config"

// Auth helper functions
export const authService = {
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<UserCredential> => {
    const auth = getFirebaseAuth()
    return signInWithEmailAndPassword(auth, email, password)
  },

  // Sign up with email and password
  signUp: async (email: string, password: string, displayName?: string): Promise<UserCredential> => {
    const auth = getFirebaseAuth()
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName })
    }
    
    return userCredential
  },

  // Sign in with Google
  signInWithGoogle: async (): Promise<UserCredential> => {
    const auth = getFirebaseAuth()
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  },

  // Sign out
  signOut: async (): Promise<void> => {
    const auth = getFirebaseAuth()
    return signOut(auth)
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const auth = getFirebaseAuth()
    return auth.currentUser
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    const auth = getFirebaseAuth()
    return onAuthStateChanged(auth, callback)
  },

  // Send password reset email
  resetPassword: async (email: string): Promise<void> => {
    const auth = getFirebaseAuth()
    return sendPasswordResetEmail(auth, email)
  },
}

