import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  StorageReference,
  UploadTask,
  FullMetadata,
} from "firebase/storage"
import { getFirebaseStorage } from "./config"

// Storage helper functions
export const storageService = {
  // Upload a file
  uploadFile: async (
    path: string,
    file: File | Blob,
    metadata?: { contentType?: string; customMetadata?: Record<string, string> },
  ): Promise<string> => {
    const storage = getFirebaseStorage()
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file, metadata)
    return getDownloadURL(storageRef)
  },

  // Upload a file with progress tracking
  uploadFileWithProgress: (
    path: string,
    file: File | Blob,
    metadata?: { contentType?: string; customMetadata?: Record<string, string> },
  ): UploadTask => {
    const storage = getFirebaseStorage()
    const storageRef = ref(storage, path)
    return uploadBytesResumable(storageRef, file, metadata)
  },

  // Get download URL
  getDownloadURL: async (path: string): Promise<string> => {
    const storage = getFirebaseStorage()
    const storageRef = ref(storage, path)
    return getDownloadURL(storageRef)
  },

  // Delete a file
  deleteFile: async (path: string): Promise<void> => {
    const storage = getFirebaseStorage()
    const storageRef = ref(storage, path)
    return deleteObject(storageRef)
  },

  // List all files in a path
  listFiles: async (path: string): Promise<StorageReference[]> => {
    const storage = getFirebaseStorage()
    const listRef = ref(storage, path)
    const result = await listAll(listRef)
    return result.items
  },

  // Get file metadata
  getMetadata: async (path: string): Promise<FullMetadata> => {
    const storage = getFirebaseStorage()
    const storageRef = ref(storage, path)
    return getMetadata(storageRef)
  },

  // Update file metadata
  updateMetadata: async (
    path: string,
    metadata: { contentType?: string; customMetadata?: Record<string, string> },
  ): Promise<FullMetadata> => {
    const storage = getFirebaseStorage()
    const storageRef = ref(storage, path)
    return updateMetadata(storageRef, metadata)
  },

  // Get a reference to a path
  ref: (path: string): StorageReference => {
    const storage = getFirebaseStorage()
    return ref(storage, path)
  },
}

