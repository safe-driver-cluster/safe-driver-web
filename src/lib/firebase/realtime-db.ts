import { ref, set, get, push, update, remove, onValue, off, DatabaseReference, DataSnapshot } from "firebase/database"
import { getFirebaseDatabase } from "./config"

// Realtime Database helper functions
export const realtimeDbService = {
  // Write data to a path
  set: async (path: string, data: any): Promise<void> => {
    const db = getFirebaseDatabase()
    const dbRef = ref(db, path)
    return set(dbRef, data)
  },

  // Get data from a path
  get: async (path: string): Promise<any> => {
    const db = getFirebaseDatabase()
    const dbRef = ref(db, path)
    const snapshot = await get(dbRef)
    return snapshot.exists() ? snapshot.val() : null
  },

  // Push data to a path (creates a new child with auto-generated key)
  push: async (path: string, data: any): Promise<string | null> => {
    const db = getFirebaseDatabase()
    const dbRef = ref(db, path)
    const newRef = push(dbRef, data)
    return newRef.key
  },

  // Update multiple paths at once
  update: async (updates: Record<string, any>): Promise<void> => {
    const db = getFirebaseDatabase()
    return update(ref(db), updates)
  },

  // Delete data at a path
  remove: async (path: string): Promise<void> => {
    const db = getFirebaseDatabase()
    const dbRef = ref(db, path)
    return remove(dbRef)
  },

  // Listen to real-time changes
  onValue: (
    path: string,
    callback: (snapshot: DataSnapshot) => void,
  ): { unsubscribe: () => void; ref: DatabaseReference } => {
    const db = getFirebaseDatabase()
    const dbRef = ref(db, path)
    onValue(dbRef, callback)
    return {
      unsubscribe: () => off(dbRef),
      ref: dbRef,
    }
  },

  // Get a reference to a path
  ref: (path: string): DatabaseReference => {
    const db = getFirebaseDatabase()
    return ref(db, path)
  },
}

