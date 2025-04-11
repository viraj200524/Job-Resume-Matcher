"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Briefcase, FileText, Users, Video, Sparkles } from "lucide-react"
import Link from "next/link"
import { RecruiterCandidateMatchChart } from "@/components/recruiter/candidate-match-chart"
import { RecruiterApplicationsChart } from "@/components/recruiter/applications-chart"
import { TopCandidates } from "@/components/recruiter/top-candidates"
import { RecentApplications } from "@/components/recruiter/recent-applications"
import { getCandidates, getJobs } from "@/lib/api"

export default function RecruiterDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recruiterData, setRecruiterData] = useState({
    company: "Tech Innovations Inc.",
    openJobs: 0,
    totalCandidates: 0,
    newApplications: 0,
    scheduledInterviews: 0,
    applicationStats: {
      pending: 0,
      reviewed: 0,
      interviewed: 0,
      offered: 0,
      rejected: 0,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        
        const jobsResponse = await getJobs()
        const jobs = jobsResponse.jobs || []

        
        const candidatesResponse = await getCandidates()
        const candidates = candidatesResponse.candidates || []

        
        
        const applications = Math.min(candidates.length * 2, 20) 
        const interviews = Math.floor(applications * 0.4) 

        
        const pending = Math.floor(applications * 0.3)
        const reviewed = Math.floor(applications * 0.25)
        const interviewed = Math.floor(applications * 0.2)
        const offered = Math.floor(applications * 0.1)
        const rejected = Math.floor(applications * 0.15)

        setRecruiterData({
          company: "Tech Innovations Inc.",
          openJobs: jobs.length,
          totalCandidates: candidates.length,
          newApplications: applications,
          scheduledInterviews: interviews,
          applicationStats: {
            pending,
            reviewed,
            interviewed,
            offered,
            rejected,
          },
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
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
            Welcome, {recruiterData.company}
          </h1>
          <p className="text-muted-foreground">Here's an overview of your recruitment activities</p>
        </div>
        <Button
          asChild
          className="mt-4 md:mt-0 bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
        >
          <Link href="/recruiter/jobs/new">
            Post New Job <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{recruiterData.openJobs}</div>
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              Total Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{recruiterData.totalCandidates}</div>
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              New Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{recruiterData.newApplications}</div>
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <Video className="h-4 w-4 text-primary" />
              </div>
              Scheduled Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{recruiterData.scheduledInterviews}</div>
              <Video className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="col-span-2 border-0 shadow-md rounded-xl overflow-hidden gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Application Status
            </CardTitle>
            <CardDescription>Overview of all applications by status</CardDescription>
          </CardHeader>
          <CardContent>
            <RecruiterApplicationsChart data={recruiterData.applicationStats} />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Top Candidates
            </CardTitle>
            <CardDescription>Highest matching candidates for your open positions</CardDescription>
          </CardHeader>
          <CardContent>
            <TopCandidates />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="mb-4 bg-white border shadow-sm">
          <TabsTrigger
            value="applications"
            className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
          >
            Recent Applications
          </TabsTrigger>
          <TabsTrigger value="matches" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
            Candidate Matches
          </TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <RecentApplications />
        </TabsContent>
        <TabsContent value="matches">
          <RecruiterCandidateMatchChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
