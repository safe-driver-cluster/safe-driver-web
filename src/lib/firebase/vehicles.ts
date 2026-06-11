import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore"
import { db } from "./config"

export interface Vehicle {
  id?: string
  documentId: string // Number plate / Vehicle registration number
  deviceId?: string // Device ID for tracking hardware/GPS device
  busNumber: string
  model: string
  year: number
  status: "active" | "maintenance" | "inactive"
  location: {
    lat: number
    lng: number
    address: string
  }
  driver: string
  driverId?: string
  driverName?: string
  route: string
  routeId?: string
  fuel: number
  mileage: number
  lastService: string
  nextService: string
  maintenanceStatus: "excellent" | "good" | "needs_attention" | "overdue"
  speed: number
  engineTemp: number
  batteryLevel: number
  alerts: number
  serviceHistory: Array<{
    date: string
    type: string
    cost: number
    description: string
  }>
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

const VEHICLES_COLLECTION = "vehicles"

// Get all vehicles
export async function getVehicles(): Promise<Vehicle[]> {
  try {
    if (!db) {
      console.error("Firestore not initialized. Please check your Firebase configuration.")
      return []
    }
    
    const vehiclesRef = collection(db, VEHICLES_COLLECTION)
    const q = query(vehiclesRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      lastService: doc.data().lastService?.toDate?.()?.toISOString().split("T")[0] || doc.data().lastService,
      nextService: doc.data().nextService?.toDate?.()?.toISOString().split("T")[0] || doc.data().nextService,
    })) as Vehicle[]
  } catch (error) {
    console.error("Error getting vehicles:", error)
    // Return empty array instead of throwing to allow fallback to mock data
    return []
  }
}

// Get vehicle by ID
export async function getVehicleById(vehicleId: string): Promise<Vehicle | null> {
  try {
    if (!db) {
      console.error("Firestore not initialized. Please check your Firebase configuration.")
      return null
    }
    
    const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId)
    const vehicleSnap = await getDoc(vehicleRef)
    
    if (vehicleSnap.exists()) {
      const data = vehicleSnap.data()
      return {
        id: vehicleSnap.id,
        ...data,
        lastService: data.lastService?.toDate?.()?.toISOString().split("T")[0] || data.lastService,
        nextService: data.nextService?.toDate?.()?.toISOString().split("T")[0] || data.nextService,
      } as Vehicle
    }
    return null
  } catch (error) {
    console.error("Error getting vehicle:", error)
    throw error
  }
}

// Get vehicle by document ID (number plate)
export async function getVehicleByDocumentId(documentId: string): Promise<Vehicle | null> {
  try {
    if (!db) {
      console.error("Firestore not initialized. Please check your Firebase configuration.")
      return null
    }
    
    const vehiclesRef = collection(db, VEHICLES_COLLECTION)
    const q = query(vehiclesRef, where("documentId", "==", documentId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        lastService: data.lastService?.toDate?.()?.toISOString().split("T")[0] || data.lastService,
        nextService: data.nextService?.toDate?.()?.toISOString().split("T")[0] || data.nextService,
      } as Vehicle
    }
    return null
  } catch (error) {
    console.error("Error getting vehicle by document ID:", error)
    throw error
  }
}

// Add new vehicle
export async function addVehicle(vehicle: Omit<Vehicle, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    if (!db) {
      throw new Error("Firestore not initialized. Please check your Firebase configuration.")
    }
    
    const vehiclesRef = collection(db, VEHICLES_COLLECTION)
    const now = Timestamp.now()
    
    const vehicleData = {
      ...vehicle,
      createdAt: now,
      updatedAt: now,
    }
    
    console.log("Adding vehicle to Firestore:", vehicleData)
    const docRef = await addDoc(vehiclesRef, vehicleData)
    console.log("Vehicle added successfully with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error adding vehicle:", error)
    throw error
  }
}

// Update vehicle
export async function updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore not initialized. Please check your Firebase configuration.")
    }
    
    const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId)
    console.log("Updating vehicle in Firestore:", vehicleId, updates)
    await updateDoc(vehicleRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
    console.log("Vehicle updated successfully")
  } catch (error) {
    console.error("Error updating vehicle:", error)
    throw error
  }
}

// Delete vehicle
export async function deleteVehicle(vehicleId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error("Firestore not initialized. Please check your Firebase configuration.")
    }
    
    const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId)
    console.log("Deleting vehicle from Firestore:", vehicleId)
    await deleteDoc(vehicleRef)
    console.log("Vehicle deleted successfully")
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    throw error
  }
}

// Subscribe to vehicles (real-time updates)
export function subscribeToVehicles(
  callback: (vehicles: Vehicle[]) => void
): () => void {
  if (!db) {
    console.error("Firestore not initialized. Cannot subscribe to vehicles.")
    return () => {} // Return empty unsubscribe function
  }
  
  const vehiclesRef = collection(db, VEHICLES_COLLECTION)
  const q = query(vehiclesRef, orderBy("createdAt", "desc"))
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const vehicles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastService: doc.data().lastService?.toDate?.()?.toISOString().split("T")[0] || doc.data().lastService,
        nextService: doc.data().nextService?.toDate?.()?.toISOString().split("T")[0] || doc.data().nextService,
      })) as Vehicle[]
      callback(vehicles)
    },
    (error) => {
      console.error("Error subscribing to vehicles:", error)
    }
  )
  
  return unsubscribe
}

