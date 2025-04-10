"use client"

// Simple authentication context for the application
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Types
export interface User {
  id: number
  name: string
  email: string
  role: "candidate" | "recruiter"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Sample users for demo purposes
// In a real app, this would be authenticated against a backend
const SAMPLE_USERS: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "candidate@example.com",
    role: "candidate",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "recruiter@example.com",
    role: "recruiter",
  },
]

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find user by email
      const foundUser = SAMPLE_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (foundUser) {
        // In a real app, you would verify the password here
        setUser(foundUser)
        localStorage.setItem("user", JSON.stringify(foundUser))
      } else {
        throw new Error("Invalid email or password")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, error }}>{children}</AuthContext.Provider>
}

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
