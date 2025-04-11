"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { getCandidates } from "@/lib/api"

export function TopCandidates() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<any[]>([])

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true)
        const response = await getCandidates()

        const topCandidates = response.candidates.slice(0, 5).map((candidate) => ({
          id: candidate.candidate_id,
          name: candidate.name,
          initials: getInitials(candidate.name),
          job_title: "Senior Frontend Developer", 
          match_score: Math.floor(Math.random() * 20) + 80,
        }))

        topCandidates.sort((a, b) => b.match_score - a.match_score)

        setCandidates(topCandidates)
      } catch (error) {
        console.error("Error fetching candidates:", error)
        setError("Failed to load top candidates")
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [])

  const getInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-sm mb-2">{error}</p>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground text-sm">No candidates found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {candidates.map((candidate) => (
        <div key={candidate.id} className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary">{candidate.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium truncate">{candidate.name}</p>
              <span className="text-xs font-medium">{candidate.match_score}%</span>
            </div>
            <Progress value={candidate.match_score} className="h-1 mt-1" />
          </div>
        </div>
      ))}
      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-full mt-4 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
      >
        <Link href="/recruiter/candidates">View All Candidates</Link>
      </Button>
    </div>
  )
}
