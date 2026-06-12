"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService } from "@/lib/firebase/auth"
import { User } from "firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
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
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
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
      setLoading(false)
      return result
    } catch (error: any) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
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
    await authService.resetPassword(email)
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      const result = await authService.signInWithGoogle()
      setLoading(false)
      return result
    } catch (error) {
      setLoading(false)
      throw error
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
