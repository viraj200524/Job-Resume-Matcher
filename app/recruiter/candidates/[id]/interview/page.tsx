"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CalendarIcon, Clock, Video, User, Building, Sparkles } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"

export default function ScheduleInterview() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const candidateId = Number(params.id)

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>("")
  const [interviewType, setInterviewType] = useState<string>("video")
  const [details, setDetails] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !time) {
      toast({
        title: "Missing information",
        description: "Please select both date and time for the interview",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // In a real app, you would make an API call to schedule the interview
      // For demo purposes, we'll simulate a successful scheduling

      setTimeout(() => {
        toast({
          title: "Interview scheduled",
          description: "The candidate has been notified of the interview details.",
        })

        // Redirect to the candidates page
        router.push("/recruiter/candidates")
      }, 1500)
    } catch (error) {
      toast({
        title: "Failed to schedule interview",
        description: "There was an error scheduling the interview. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return <AuthCheck requiredRole="recruiter" />
  }

  return (
    <AuthCheck requiredRole="recruiter">
      <div className="container mx-auto p-6 bg-grid">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center">
              <Sparkles className="h-8 w-8 mr-2 text-primary" />
              Schedule Interview
            </h1>
            <p className="text-muted-foreground">Set up an interview with the candidate</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
              <CardDescription>Schedule an interview with Candidate #{candidateId}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Interview Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Interview Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="time"
                          placeholder="Select time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Interview Type</Label>
                    <RadioGroup
                      defaultValue="video"
                      onValueChange={setInterviewType}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="video" />
                        <Label htmlFor="video" className="flex items-center cursor-pointer">
                          <Video className="mr-2 h-4 w-4" />
                          Video Interview
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-person" id="in-person" />
                        <Label htmlFor="in-person" className="flex items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          In-Person Interview
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone" />
                        <Label htmlFor="phone" className="flex items-center cursor-pointer">
                          <Building className="mr-2 h-4 w-4" />
                          Phone Interview
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details">Additional Details</Label>
                    <Textarea
                      id="details"
                      placeholder="Provide any additional information for the candidate"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                    disabled={submitting || !date || !time}
                  >
                    {submitting ? "Scheduling..." : "Schedule Interview"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthCheck>
  )
}
