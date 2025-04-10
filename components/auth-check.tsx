"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

interface AuthCheckProps {
  children: React.ReactNode
  requiredRole?: "candidate" | "recruiter"
}

export function AuthCheck({ children, requiredRole }: AuthCheckProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user, redirect to login
        router.push("/login")
      } else if (requiredRole && user.role !== requiredRole) {
        // Wrong role, redirect to appropriate dashboard
        if (user.role === "candidate") {
          router.push("/candidate/dashboard")
        } else {
          router.push("/recruiter/dashboard")
        }
      }
    }
  }, [user, loading, router, requiredRole])

  // Show loading state while checking auth
  if (loading || !user || (requiredRole && user.role !== requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
