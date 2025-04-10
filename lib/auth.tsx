import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getCandidateByEmail } from "./api"

export type UserRole = "candidate" | "recruiter" | null

export interface User {
  id: number | null
  email: string
  name: string
  role: UserRole
  isAuthenticated: boolean
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, password: string, role: UserRole) => Promise<User>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<User>
  logout: () => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setIsLoading: (isLoading) => set({ isLoading }),
      login: async (email, password, role) => {
        set({ isLoading: true })
        
        try {
          // In a real app, this would be an API call to authenticate
          // For demo purposes, we'll simulate a successful login
          
          // If role is candidate, try to fetch candidate data by email
          let userId = null
          let userName = ""
          
          if (role === "candidate") {
            try {
              const response = await getCandidateByEmail(email)
              if (response.candidate) {
                userId = response.candidate.candidate_id
                userName = response.candidate.name
              }
            } catch (error) {
              console.error("Error fetching candidate:", error)
              // If candidate not found, we'll use demo data
              userId = 1
              userName = "Demo Candidate"
            }
          } else {
            // For recruiters, use demo data
            userId = 1
            userName = "Demo Recruiter"
          }
          
          const user: User = {
            id: userId,
            email,
            name: userName,
            role,
            isAuthenticated: true,
          }
          
          set({ user, isLoading: false })
          return user
        } catch (error) {
          set({ isLoading: false })
          throw new Error("Login failed")
        }
      },
      register: async (name, email, password, role) => {
        set({ isLoading: true })
        
        try {
          // In a real app, this would be an API call to register
          // For demo purposes, we'll simulate a successful registration
          
          // For candidates, we would create a new candidate record
          // For recruiters, we would create a new recruiter record
          
          const user: User = {
            id: 1, // This would be returned from the API
            email,
            name,
            role,
            isAuthenticated: true,
          }
          
          set({ user, isLoading: false })
          return user
        } catch (error) {
          set({ isLoading: false })
          throw new Error("Registration failed")
        }
      },
      logout: () => {
        set({ user: null })
      },
    }),
    {
      name: "auth-storage",
    }
  )
)
