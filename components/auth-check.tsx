"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface AuthCheckProps {
  children?: React.ReactNode
  requiredRole?: UserRole
}

export function AuthCheck({ children, requiredRole }: AuthCheckProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (requiredRole && user.role !== requiredRole) {
      // Redirect to the appropriate dashboard if the user has the wrong role
      if (user.role === "candidate") {
        router.push("/candidate/dashboard")
      } else if (user.role === "recruiter") {
        router.push("/recruiter/dashboard")
      }
    }
  }, [user, requiredRole, router])

  if (!user) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to access this page</p>
          <Button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page. This page is for {requiredRole}s only.
          </p>
          <Button
            onClick={() => router.push(user.role === "candidate" ? "/candidate/dashboard" : "/recruiter/dashboard")}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
