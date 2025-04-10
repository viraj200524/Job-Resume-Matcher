"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Video, Sparkles } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"

export default function CandidateInterviews() {
  const { user } = useAuth()
  const [loading] = useState(false)

  // Mock interview data
  const interviews = [
    {
      id: 1,
      company: "Tech Innovations Inc.",
      position: "Senior Frontend Developer",
      date: "2023-06-15",
      time: "10:00 AM",
      type: "Video",
      status: "Scheduled",
      interviewer: "Sarah Johnson",
      location: "Remote",
    },
    {
      id: 2,
      company: "Digital Solutions",
      position: "React Developer",
      date: "2023-06-18",
      time: "2:30 PM",
      type: "In-person",
      status: "Scheduled",
      interviewer: "Michael Chen",
      location: "123 Main St, San Francisco, CA",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
      case "Completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
      case "Cancelled":
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
        ) : interviews.length > 0 ? (
          <div className="space-y-6">
            {interviews.map((interview) => (
              <Card key={interview.id} className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {interview.company.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{interview.position}</h3>
                          <Badge variant="outline" className={getStatusColor(interview.status)}>
                            {interview.status}
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
                            {interview.time}
                          </div>
                          <div className="flex items-center">
                            {interview.type === "Video" ? (
                              <Video className="h-3 w-3 mr-1" />
                            ) : (
                              <MapPin className="h-3 w-3 mr-1" />
                            )}
                            {interview.type} Interview
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
                      {interview.type === "Video" && interview.status === "Scheduled" && (
                        <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                          <Link href={`/candidate/interviews/${interview.id}`}>
                            <Video className="mr-2 h-4 w-4" />
                            Join Interview
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                      >
                        View Details
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
