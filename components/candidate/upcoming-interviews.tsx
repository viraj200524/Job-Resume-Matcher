"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video } from "lucide-react"
import Link from "next/link"
import { getCandidateApplications } from "@/lib/api"
import type { Application } from "@/lib/api"

interface UpcomingInterviewsProps {
  candidateId: number
}

export function UpcomingInterviews({ candidateId }: UpcomingInterviewsProps) {
  const [interviews, setInterviews] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true)
        const response = await getCandidateApplications(candidateId)
        // Filter applications with "Interview" status
        const interviewApplications = response.applications.filter((app) => app.status === "Interview")
        setInterviews(interviewApplications)
      } catch (error) {
        console.error("Error fetching interviews:", error)
        setError("Failed to load interviews")
      } finally {
        setLoading(false)
      }
    }

    fetchInterviews()
  }, [candidateId])

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

  return (
    <div className="space-y-4">
      {interviews.length === 0 ? (
        <Card className="border-0 shadow-md rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No upcoming interviews</p>
          </CardContent>
        </Card>
      ) : (
        interviews.map((interview) => {
          // For demo purposes, generate a random future date for the interview
          const interviewDate = new Date()
          interviewDate.setDate(interviewDate.getDate() + Math.floor(Math.random() * 14) + 1)

          // Random time slots
          const timeSlots = ["10:00 AM", "2:30 PM", "4:00 PM"]
          const randomTimeIndex = Math.floor(Math.random() * timeSlots.length)
          const interviewTime = timeSlots[randomTimeIndex]

          // Random durations
          const durations = ["30 minutes", "45 minutes", "60 minutes"]
          const randomDurationIndex = Math.floor(Math.random() * durations.length)
          const duration = durations[randomDurationIndex]

          return (
            <Card
              key={interview.application_id}
              className="border-0 shadow-md rounded-xl overflow-hidden card-hover-effect"
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h3 className="font-semibold">{interview.job_title}</h3>
                    <p className="text-sm text-muted-foreground">{interview.company}</p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{interviewDate.toLocaleDateString()}</span>
                      <Clock className="h-3 w-3 ml-3 mr-1" />
                      <span>
                        {interviewTime} ({duration})
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                    >
                      Scheduled
                    </Badge>
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="gap-1 bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                    >
                      <Link href={`/candidate/interviews/${interview.application_id}`}>
                        <Video className="h-4 w-4" />
                        Join Interview
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
