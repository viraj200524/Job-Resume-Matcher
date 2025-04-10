"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Building, MapPin, Video } from "lucide-react"
import { createVideoRoom } from "@/lib/daily"

export default function InterviewPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roomUrl, setRoomUrl] = useState<string | null>(null)

  // This would normally be fetched from the API
  const interviewData = {
    id: Number.parseInt(params.id),
    job_title: "Senior Frontend Developer",
    company: "Tech Solutions Inc.",
    location: "Remote",
    date: "2023-04-20",
    time: "10:00 AM",
    duration: "45 minutes",
    status: "Scheduled",
    interviewer: "Sarah Johnson",
    interviewer_title: "Engineering Manager",
    description:
      "This interview will focus on your technical skills and experience with React, TypeScript, and modern web development practices. Please be prepared to discuss your past projects and potentially solve some coding problems.",
  }

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        setLoading(true)
        // In a real app, you would check if a room already exists for this interview
        // and only create a new one if needed
        const room = await createVideoRoom({
          name: `interview-${interviewData.id}`,
          expiresInMinutes: 60,
          properties: {
            start_audio_off: false,
            start_video_off: false,
            enable_chat: true,
            enable_screenshare: true,
          },
        })

        setRoomUrl(room.url)
        setLoading(false)
      } catch (err) {
        console.error("Failed to create video room:", err)
        setError("Failed to initialize video conference. Please try again.")
        setLoading(false)
      }
    }

    initializeRoom()
  }, [interviewData.id])

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Details</h1>
          <p className="text-muted-foreground">
            {interviewData.job_title} at {interviewData.company}
          </p>
        </div>
        <Badge variant="outline" className="mt-2 md:mt-0 bg-green-100 text-green-800 hover:bg-green-100">
          {interviewData.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
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
                  <p className="text-sm text-muted-foreground">{interviewData.location}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-1">Interviewer</h3>
                <p className="text-sm">{interviewData.interviewer}</p>
                <p className="text-sm text-muted-foreground">{interviewData.interviewer_title}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{interviewData.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Video Conference</CardTitle>
              <CardDescription>Join the video conference for your interview</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[500px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p>Initializing video conference...</p>
                </div>
              ) : error ? (
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
              ) : roomUrl ? (
                <div className="w-full h-full">
                  <iframe
                    title="Video Conference"
                    src={roomUrl}
                    allow="camera; microphone; fullscreen; speaker; display-capture"
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
                  <Button onClick={() => window.location.reload()}>Join Interview</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
