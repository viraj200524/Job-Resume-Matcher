"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, MapPin, Video, Mail } from "lucide-react"
import { createVideoRoom } from "@/lib/daily"
import { sendEmail, generateInterviewInvitationEmail } from "@/lib/email"
import { useToast } from "@/hooks/use-toast"

export default function RecruiterInterviewPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const { toast } = useToast()

  // This would normally be fetched from the API
  const interviewData = {
    id: Number.parseInt(params.id),
    candidate_name: "John Doe",
    candidate_email: "john.doe@example.com",
    job_title: "Senior Frontend Developer",
    company: "Tech Solutions Inc.",
    location: "Remote",
    date: "2023-04-20",
    time: "10:00 AM",
    duration: "45 minutes",
    status: "Scheduled",
    notes: "Focus on React experience and system design skills. Ask about previous projects and team collaboration.",
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

  const handleSendInvitation = async () => {
    if (!roomUrl) return

    setSendingEmail(true)
    try {
      // In a real app, this would be a server action or API call
      const emailHtml = generateInterviewInvitationEmail(
        interviewData.candidate_name,
        interviewData.job_title,
        interviewData.company,
        formatDate(interviewData.date),
        interviewData.time,
        roomUrl,
      )

      // This would be handled server-side in a real app
      await sendEmail({
        to: interviewData.candidate_email,
        subject: `Interview Invitation: ${interviewData.job_title} at ${interviewData.company}`,
        html: emailHtml,
      })

      toast({
        title: "Invitation sent",
        description: `Interview invitation has been sent to ${interviewData.candidate_name}`,
      })
    } catch (err) {
      console.error("Failed to send invitation:", err)
      toast({
        variant: "destructive",
        title: "Failed to send invitation",
        description: "There was an error sending the interview invitation. Please try again.",
      })
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Details</h1>
          <p className="text-muted-foreground">
            {interviewData.job_title} with {interviewData.candidate_name}
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
                <User className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Candidate</h3>
                  <p className="text-sm text-muted-foreground">{interviewData.candidate_name}</p>
                  <p className="text-sm text-muted-foreground">{interviewData.candidate_email}</p>
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
                <h3 className="font-medium mb-1">Interview Notes</h3>
                <p className="text-sm">{interviewData.notes}</p>
              </div>

              <Button onClick={handleSendInvitation} disabled={!roomUrl || sendingEmail} className="w-full gap-2">
                <Mail className="h-4 w-4" />
                {sendingEmail ? "Sending..." : "Send Invitation Email"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Video Conference</CardTitle>
              <CardDescription>Host the video interview with the candidate</CardDescription>
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
                  <h3 className="text-lg font-medium mb-2">Ready to host?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the button below to start the video conference
                  </p>
                  <Button onClick={() => window.location.reload()}>Start Interview</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
