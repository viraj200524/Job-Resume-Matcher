"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Building, MapPin, Video, AlertCircle } from "lucide-react"
import { createVideoRoom } from "@/lib/jitsi"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getInterview,  } from "@/lib/api"

export default function InterviewPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [interviewData, setInterviewData] = useState<any>(null)

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        setLoading(true)

        const response = await getInterview(Number(params.id))
        
        if (response) {
          setInterviewData(response.interview)
          // setInterviewData(interview)
        } else {
          setError("Interview not found")
        }
      } catch (err) {
        console.error("Failed to fetch interview data:", err)
        setError("Failed to load interview details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchInterviewData()
    }
  }, [params.id, user])

  const initializeRoom = async () => {
    try {
      setJoining(true)
      // In a real app, you would check if a room already exists for this interview
      // and only create a new one if needed
      const room = await createVideoRoom({
        roomName: `interview-${interviewData.interview_id}`,
        config: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableClosePage: true,
        },
      })

      setRoomUrl(room.url)
      setJoining(false)
    } catch (err) {
      console.error("Failed to create video room:", err)
      setError("Failed to initialize video conference. Please try again.")
      setJoining(false)
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (!user) {
    return <AuthCheck requiredRole="candidate" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !interviewData) {
    return (
      <AuthCheck requiredRole="candidate">
        <div className="container mx-auto p-6">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>There was a problem loading the interview details</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error || "Interview not found"}</AlertDescription>
              </Alert>
              <Button onClick={() => window.location.reload()} className="mr-2">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthCheck>
    )
  }

  return (
    <AuthCheck requiredRole="candidate">
      <div className="container mx-auto p-6 bg-grid">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Interview Details</h1>
            <p className="text-muted-foreground">
              {interviewData.job_title} at {interviewData.company}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`mt-2 md:mt-0 ${
              interviewData.status.toLowerCase() === "scheduled"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : interviewData.status.toLowerCase() === "completed"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
            }`}
          >
            {interviewData.status.charAt(0).toUpperCase() + interviewData.status.slice(1)}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle>Interview Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Date</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(interviewData.date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Time</h3>
                    <p className="text-sm text-muted-foreground">
                      {interviewData.time} ({interviewData.duration})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Company</h3>
                    <p className="text-sm text-muted-foreground">{interviewData.company}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-sm text-muted-foreground">
                      {interviewData.location || "Remote (Video Interview)"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-1">Interviewer</h3>
                  <p className="text-sm">{interviewData.recruiter_name || "Hiring Manager"}</p>
                  <p className="text-sm text-muted-foreground">{"Recruiter"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle>Interview Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{interviewData.notes || "No additional details provided for this interview."}</p>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="h-full border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle>Video Conference</CardTitle>
                <CardDescription>Join the video conference for your interview</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[500px]">
                {error ? (
                  <div className="text-center">
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                  </div>
                ) : roomUrl ? (
                  <div className="w-full h-full">
                    <iframe
                      title="Video Conference"
                      src={roomUrl}
                      allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                      style={{ width: "100%", height: "100%", border: "none", borderRadius: "0.5rem" }}
                    ></iframe>
                  </div>
                ) : (
                  <div className="text-center">
                    <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Ready to join?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click the button below to join the video conference
                    </p>
                    <Button
                      onClick={initializeRoom}
                      disabled={
                        joining ||
                        interviewData.type.toLowerCase() !== "video" ||
                        interviewData.status.toLowerCase() !== "scheduled"
                      }
                      className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                    >
                      {joining ? "Connecting..." : "Join Interview"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthCheck>
  )
}
