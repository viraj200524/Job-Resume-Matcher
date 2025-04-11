"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Briefcase, MapPin, GraduationCap, Share2, FileText, CheckCircle2, XCircle, Calendar, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"
import { getJob, getJobApplicants } from "@/lib/api"

export default function JobDetailsPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const jobId = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [job, setJob] = useState<any>(null)
  const [applicants, setApplicants] = useState<any[]>([])

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true)

        const jobResponse = await getJob(jobId)
        setJob(jobResponse.job)

        const applicantsData = await getJobApplicants(jobId)
        setApplicants(applicantsData.applications)
      } catch (err) {
        console.error("Error fetching job data:", err)
        setError("Failed to load job details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchJobData()
  }, [jobId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
      case "Interview":
        return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
      case "Hired":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (!user) {
    return <AuthCheck requiredRole="recruiter" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <AuthCheck requiredRole="recruiter">
        <div className="container mx-auto p-6">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>There was a problem loading the job details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">{error || "Job not found"}</p>
              <Button onClick={() => window.location.reload()} className="mr-2 mt-4">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push("/recruiter/jobs")}>
                Back to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthCheck>
    )
  }

  return (
    <AuthCheck requiredRole="recruiter">
      <div className="container mx-auto p-6 bg-grid">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{job.job_title}</h1>
            <p className="text-muted-foreground">
              {job.company} • {job.location}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white gap-2">
              <FileText className="h-4 w-4" />
              Edit Job
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="bg-background border">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="applicants">Applicants ({applicants.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Experience</h3>
                      <p className="text-sm text-muted-foreground">{job.experience}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Location</h3>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Qualifications</h3>
                      <p className="text-sm text-muted-foreground">{job.qualifications}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.split(",").map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-primary/5">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Responsibilities</h3>
                  <p className="text-sm">{job.responsibilities}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Benefits</h3>
                  <p className="text-sm">{job.benefits}</p>
                </div>

                {job.other_details && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Additional Information</h3>
                      <p className="text-sm">{job.other_details}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applicants" className="space-y-6">
            {applicants.length > 0 ? (
              <div className="space-y-4">
                {applicants.map((applicant) => (
                  <Card
                    key={applicant.application_id}
                    className="border-0 shadow-md rounded-xl overflow-hidden gradient-border"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">Candidate #{applicant.candidate_id}</h3>
                              <Badge variant="outline" className={getStatusColor(applicant.status)}>
                                {applicant.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Applied on {formatDate(applicant.application_date)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2">
                          <Button
                            variant="outline"
                            className="hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                            asChild
                          >
                            <Link href={`/recruiter/candidates/${applicant.candidate_id}`}>View Profile</Link>
                          </Button>
                          {applicant.status === "Under Review" && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white" asChild>
                                <Link href={`/recruiter/applications/${applicant.application_id}/schedule`}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Schedule Interview
                                </Link>
                              </Button>
                            </div>
                          )}
                          {applicant.status === "Interview" && (
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white" asChild>
                              <Link href={`/recruiter/interviews/1`}>
                                <Calendar className="h-4 w-4 mr-2" />
                                View Interview
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                <CardHeader>
                  <CardTitle>No Applicants Yet</CardTitle>
                  <CardDescription>This job posting hasn't received any applications</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <User className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    When candidates apply for this job, they will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthCheck>
  )
}
