// Firebase exports
export * from "./config"
export * from "./auth"
export * from "./firestore"
export * from "./realtime-db"
export * from "./storage"

// Re-export Firebase types
export type { User, UserCredential } from "firebase/auth"
export type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
export type { DataSnapshot, DatabaseReference } from "firebase/database"
export type { StorageReference, UploadTask, FullMetadata } from "firebase/storage"

