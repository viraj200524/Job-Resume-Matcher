"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Building, MapPin, FileText, Eye, Sparkles } from "lucide-react"
import Link from "next/link"
import { getCandidateApplications, getCandidateByEmail } from "@/lib/api"
import type { Application } from "@/lib/api"

import { useAuth } from "@/lib/auth"

export default function CandidateApplications() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [activeTab, setActiveTab] = useState("all")
  
  const { user } = useAuth()
  
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.email) return

      try {
        setLoading(true)

        
        try {
          const candidateResponse = await getCandidateByEmail(user.email)

          if (!candidateResponse.candidate) {
            setError("Candidate profile not found. Please complete your profile first.")
            setLoading(false)
            return
          }

          
          const response = await getCandidateApplications(candidateResponse.candidate.candidate_id)
          setApplications(response.applications)
        } catch (error) {
          console.error("Error fetching applications:", error)
          setError("Failed to load applications. Please try again later.")
        } finally {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error fetching applications:", error)
        setError("Failed to load applications. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchApplications()
    }
  }, [user])

  
  const filteredApplications = applications.filter((application) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return ["Pending", "Reviewing"].includes(application.status)
    if (activeTab === "interview") return application.status === "Interview"
    if (activeTab === "completed") return ["Rejected", "Offered"].includes(application.status)
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
      case "Reviewing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
      case "Interview":
        return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
      case "Offered":
        return "bg-primary/10 text-primary hover:bg-primary/10 border-primary/20"
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

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 bg-grid">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center">
            <Sparkles className="h-8 w-8 mr-2 text-primary" />
            My Applications
          </h1>
          <p className="text-muted-foreground">Track the status of your job applications</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full mb-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="all" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
            All Applications
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
            Active
          </TabsTrigger>
          <TabsTrigger value="interview" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
            Interviews
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        {filteredApplications.length === 0 ? (
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No applications found</p>
              <Button asChild className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all">
                <Link href="/candidate/matches">Browse Job Matches</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card
              key={application.application_id}
              className="overflow-hidden border-0 shadow-md rounded-xl card-hover-effect"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{application.job_title}</h3>
                      <Badge variant="outline" className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {application.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {application.location || "Remote"}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Applied on {formatDate(application.application_date)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-1">
                      <Link href={`/candidate/applications/${application.application_id}`}>
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                    {application.status === "Interview" && (
                      <Button
                        asChild
                        size="sm"
                        className="gap-1 bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                      >
                        <Link href={`/candidate/interviews/${application.application_id}`}>
                          <Clock className="h-4 w-4" />
                          Join Interview
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {application.status === "Interview" && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                    <div className="flex items-center text-green-800 font-medium mb-1">
                      <Clock className="h-4 w-4 mr-2" />
                      Interview Scheduled
                    </div>
                    <p className="text-sm text-green-700">Please check your email for interview details</p>
                  </div>
                )}

                {application.status === "Rejected" && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <div className="flex items-center text-red-800 font-medium mb-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Application Status
                    </div>
                    <p className="text-sm text-red-700">
                      Your application was not selected for this position. Keep applying!
                    </p>
                  </div>
                )}

                {application.status === "Offered" && (
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3 mb-4">
                    <div className="flex items-center text-primary font-medium mb-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Offer Received
                    </div>
                    <p className="text-sm text-primary/80">
                      Congratulations! You've received a job offer. Check your email for details.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
