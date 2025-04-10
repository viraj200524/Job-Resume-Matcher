"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, User } from "lucide-react"
import Link from "next/link"
import { getCandidates } from "@/lib/api"

export function RecruiterCandidateMatchChart() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [candidateMatches, setCandidateMatches] = useState<any[]>([])

  useEffect(() => {
    const fetchCandidateMatches = async () => {
      try {
        setLoading(true)
        // In a real app, you would fetch candidate matches from the API
        // For now, we'll simulate matches based on candidates
        const response = await getCandidates()

        // Generate random matches from candidates
        const jobTitles = ["Senior Frontend Developer", "React Developer", "Full Stack Engineer"]

        const candidateMatches = response.candidates.slice(0, 3).map((candidate) => {
          // Generate random scores
          const matchScore = Math.floor(Math.random() * 15) + 80 // 80-95
          const skillScore = Math.floor(Math.random() * 15) + 80 // 80-95
          const experienceScore = Math.floor(Math.random() * 20) + 75 // 75-95

          return {
            id: candidate.candidate_id,
            name: candidate.name,
            job_title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
            match_score: matchScore,
            skills: (candidate.skills || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, 4),
            experience: candidate.experience || "3+ years",
          }
        })

        // Sort by match score
        candidateMatches.sort((a, b) => b.match_score - a.match_score)

        setCandidateMatches(candidateMatches)
      } catch (error) {
        console.error("Error fetching candidate matches:", error)
        setError("Failed to load candidate matches")
      } finally {
        setLoading(false)
      }
    }

    fetchCandidateMatches()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (candidateMatches.length === 0) {
    return (
      <Card className="border-0 shadow-md rounded-xl overflow-hidden">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No candidate matches found</p>
          <Button asChild className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all">
            <Link href="/recruiter/jobs/new">Post a Job</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {candidateMatches.map((candidate) => (
        <Card key={candidate.id} className="border-0 shadow-md rounded-xl overflow-hidden card-hover-effect">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">For: {candidate.job_title}</p>
                </div>
              </div>
              <div className="flex items-center mt-2 md:mt-0">
                <span className="text-2xl font-bold mr-2">{candidate.match_score}%</span>
                <span className="text-sm text-muted-foreground">Match</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Match Score</span>
                <span>{candidate.match_score}%</span>
              </div>
              <Progress value={candidate.match_score} className="h-2" />
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hover:bg-primary/10 hover:text-primary hover:border-primary/20"
              >
                <Link href={`/recruiter/candidates/${candidate.id}`}>
                  View Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
