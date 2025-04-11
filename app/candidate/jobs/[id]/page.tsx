"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Briefcase, MapPin, GraduationCap, Heart, Share2, Send, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"
import { getJob, getCandidateByEmail, createApplication } from "@/lib/api"

export default function JobDetailsPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const jobId = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [job, setJob] = useState<any>(null)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true)

        const jobResponse = await getJob(jobId)
        setJob(jobResponse.job)

        setHasApplied(false)
      } catch (err) {
        console.error("Error fetching job data:", err)
        setError("Failed to load job details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchJobData()
  }, [jobId])

  const handleApply = async () => {
    if (!user?.email) return

    setApplying(true)
    try {
      const candidateResponse = await getCandidateByEmail(user.email)

      if (!candidateResponse.candidate) {
        toast({
          title: "Profile not found",
          description: "Please complete your profile before applying for jobs.",
          variant: "destructive",
        })
        router.push("/candidate/profile")
        return
      }

      await createApplication(candidateResponse.candidate.candidate_id, jobId)

      setHasApplied(true)
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted.",
      })
    } catch (err) {
      console.error("Error applying for job:", err)
      toast({
        title: "Application failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
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

  if (error || !job) {
    return (
      <AuthCheck requiredRole="candidate">
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
              <Button variant="outline" onClick={() => router.push("/candidate/matches")}>
                Back to Jobs
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
            <h1 className="text-3xl font-bold tracking-tight">{job.job_title}</h1>
            <p className="text-muted-foreground">
              {job.company} • {job.location}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" className="gap-2">
              <Heart className="h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            {hasApplied ? (
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" disabled>
                <CheckCircle className="h-4 w-4" />
                Applied
              </Button>
            ) : (
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white gap-2"
                onClick={handleApply}
                disabled={applying}
              >
                <Send className="h-4 w-4" />
                {applying ? "Applying..." : "Apply Now"}
              </Button>
            )}
          </div>
        </div>

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

            <div className="pt-4">
              {hasApplied ? (
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2" disabled>
                  <CheckCircle className="h-4 w-4" />
                  Application Submitted
                </Button>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white gap-2"
                  onClick={handleApply}
                  disabled={applying}
                >
                  <Send className="h-4 w-4" />
                  {applying ? "Submitting Application..." : "Apply for this Position"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthCheck>
  )
}
