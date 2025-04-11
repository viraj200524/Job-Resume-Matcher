"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Video, Sparkles } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"
import { getCandidateInterviews, getCandidateByEmail } from "@/lib/api"

export default function CandidateInterviews() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interviews, setInterviews] = useState<any[]>([])

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user?.email) return

      try {
        setLoading(true)

        const candidateResponse = await getCandidateByEmail(user.email)
        const interviewsResponse = await getCandidateInterviews(candidateResponse.candidate.candidate_id)
        setInterviews(interviewsResponse.interviews)

      } catch (error) {
        console.error("Error fetching interviews:", error)
        setError("Failed to load interviews. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchInterviews()
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (!user) {
    return <AuthCheck requiredRole="candidate" />
  }

  return (
    <AuthCheck requiredRole="candidate">
      <div className="container mx-auto p-6 bg-grid">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center">
              <Sparkles className="h-8 w-8 mr-2 text-primary" />
              My Interviews
            </h1>
            <p className="text-muted-foreground">Manage your upcoming and past interviews</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>There was a problem loading your interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : interviews.length > 0 ? (
          <div className="space-y-6">
            {interviews.map((interview) => (
              <Card
                key={interview.interview_id}
                className="border-0 shadow-md rounded-xl overflow-hidden gradient-border"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {interview.company?.substring(0, 2).toUpperCase() || "JD"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{interview.job_title}</h3>
                          <Badge variant="outline" className={getStatusColor(interview.status)}>
                            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{interview.company}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(interview.date)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {interview.time} ({interview.duration})
                          </div>
                          <div className="flex items-center">
                            {interview.type.toLowerCase() === "video" ? (
                              <Video className="h-3 w-3 mr-1" />
                            ) : (
                              <MapPin className="h-3 w-3 mr-1" />
                            )}
                            {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview
                          </div>
                        </div>
                        {interview.location && (
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {interview.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-2">
                      {interview.type.toLowerCase() === "video" && interview.status.toLowerCase() === "scheduled" && (
                        <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                          <Link href={`/candidate/interviews/${interview.interview_id}`}>
                            <Video className="mr-2 h-4 w-4" />
                            Join Interview
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                        asChild
                      >
                        <Link href={`/candidate/interviews/${interview.interview_id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle>No Interviews Scheduled</CardTitle>
              <CardDescription>You don't have any upcoming interviews</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-center max-w-md mb-6">
                When you apply for jobs and recruiters schedule interviews with you, they will appear here.
              </p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                <Link href="/candidate/matches">Browse Job Matches</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthCheck>
  )
}
