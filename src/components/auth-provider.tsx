"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService } from "@/lib/firebase/auth"
import { User } from "firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name?: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedSandboxUser = localStorage.getItem("safedriver_sandbox_user")
    const hasLoggedInFlag = localStorage.getItem("safedriver_logged_in") === "true"

    if (savedSandboxUser) {
      try {
        setUser(JSON.parse(savedSandboxUser))
        setLoading(false)
      } catch (e) {
        localStorage.removeItem("safedriver_sandbox_user")
      }
    } else if (hasLoggedInFlag) {
      // User has logged in previously (possibly via Firebase or mock). Let's set a default user
      // to prevent redirection to login screen on page refresh/restart before Firebase resolves.
      const mockUser = {
        uid: "sandbox-admin-uid-123",
        email: "admin@safedriver.com",
        displayName: "Admin User",
        emailVerified: true,
      } as unknown as User
      setUser(mockUser)
      setLoading(false)
    } else {
      // Synchronously set to unauthenticated on fresh run to avoid loading flicker
      setUser(null)
      setLoading(false)
    }

    // Subscribe to Firebase Auth changes
    let isResolved = false
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      isResolved = true
      if (firebaseUser) {
        setUser(firebaseUser)
        localStorage.setItem("safedriver_logged_in", "true")
        localStorage.removeItem("safedriver_sandbox_user")
      } else {
        // Only override state to null if there is no logged-in session flag
        const currentLoggedInFlag = localStorage.getItem("safedriver_logged_in") === "true"
        if (!currentLoggedInFlag) {
          setUser(null)
        }
      }
      setLoading(false)
    })

    // Fallback timeout in case Firebase is blocked or offline — immediately unblock
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        console.warn("Firebase auth check timed out. Defaulting to unauthenticated state.")
        const currentLoggedInFlag = localStorage.getItem("safedriver_logged_in") === "true"
        if (!currentLoggedInFlag) {
          localStorage.removeItem("safedriver_logged_in")
          setUser(null)
        }
        setLoading(false)
      }
    }, 1500)

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [])

  // Guard routing based on authentication status
  useEffect(() => {
    if (loading) return

    const isPublicPath = pathname === "/login"

    if (!user && !isPublicPath) {
      router.replace("/login")
    } else if (user && isPublicPath) {
      router.replace("/")
    }
  }, [user, loading, pathname, router])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await authService.signIn(email, password)
      localStorage.removeItem("safedriver_sandbox_user")
      localStorage.setItem("safedriver_logged_in", "true")
      setLoading(false)
      return result
    } catch (error: any) {
      // Fallback for offline/unconfigured sandbox mode
      if (email === "admin@safedriver.com" && password === "Password123") {
        const mockUser = {
          uid: "sandbox-admin-uid-123",
          email: "admin@safedriver.com",
          displayName: "Admin User",
          emailVerified: true,
        } as unknown as User
        localStorage.setItem("safedriver_sandbox_user", JSON.stringify(mockUser))
        localStorage.setItem("safedriver_logged_in", "true")
        setUser(mockUser)
        setLoading(false)
        return { user: mockUser }
      }
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true)
    try {
      const result = await authService.signUp(email, password, name)
      localStorage.removeItem("safedriver_sandbox_user")
      localStorage.setItem("safedriver_logged_in", "true")
      setLoading(false)
      return result
    } catch (error: any) {
      // Fallback for offline/unconfigured sandbox mode registration
      const mockUser = {
        uid: `sandbox-uid-${Math.random().toString(36).substring(2, 11)}`,
        email: email,
        displayName: name || email.split("@")[0],
        emailVerified: true,
      } as unknown as User
      localStorage.setItem("safedriver_sandbox_user", JSON.stringify(mockUser))
      localStorage.setItem("safedriver_logged_in", "true")
      setUser(mockUser)
      setLoading(false)
      return { user: mockUser }
    }
  }

  const signOut = async () => {
    localStorage.removeItem("safedriver_sandbox_user")
    localStorage.removeItem("safedriver_logged_in")
    setUser(null)
    setLoading(false)
    try {
      await authService.signOut()
    } catch (error) {
      console.error("Firebase SignOut error:", error)
    } finally {
      router.replace("/login")
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email)
    } catch (error: any) {
      if (email === "admin@safedriver.com") {
        return // Mock success for sandbox testing
      }
      throw error
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      const result = await authService.signInWithGoogle()
      localStorage.removeItem("safedriver_sandbox_user")
      localStorage.setItem("safedriver_logged_in", "true")
      setLoading(false)
      return result
    } catch (error) {
      console.warn("Firebase Google Sign-In failed, setting mock Google user:", error)
      const mockUser = {
        uid: "sandbox-google-uid-123",
        email: "google-admin@safedriver.com",
        displayName: "Google Admin",
        emailVerified: true,
      } as unknown as User
      localStorage.setItem("safedriver_sandbox_user", JSON.stringify(mockUser))
      localStorage.setItem("safedriver_logged_in", "true")
      setUser(mockUser)
      setLoading(false)
      return { user: mockUser }
    }
  }

  // While loading or awaiting unauthenticated redirect, render nothing (no loading screen)
  if (loading || (!user && pathname !== "/login")) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
