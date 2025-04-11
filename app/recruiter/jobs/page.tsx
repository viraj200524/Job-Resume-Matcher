"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, ArrowUpDown, Edit, Trash2, Users, Calendar, Sparkles } from "lucide-react"
import Link from "next/link"
import { getJobs } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"

export default function RecruiterJobs() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await getJobs()

        
        const transformedJobs = response.jobs.map((job) => {
          
          const postedDate = new Date()
          postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 30))

          const expiresDate = new Date(postedDate)
          expiresDate.setDate(postedDate.getDate() + 30)

          
          const statuses = ["Active", "Expired", "Draft"]
          const status = statuses[Math.floor(Math.random() * statuses.length)]

          
          const applicants = Math.floor(Math.random() * 20)
          const interviews = Math.floor(Math.random() * applicants)

          
          const requiredSkills = (job.required_skills || "React, TypeScript, JavaScript, CSS, HTML")
            .split(",")
            .map((s: string) => s.trim())

          return {
            ...job,
            company: job.company || "Tech Solutions Inc.",
            location: job.location || "San Francisco, CA (Remote)",
            posted_date: postedDate.toISOString().split("T")[0],
            expires_date: expiresDate.toISOString().split("T")[0],
            status,
            applicants,
            interviews,
            required_skills: requiredSkills,
          }
        })

        setJobs(transformedJobs)
      } catch (error) {
        console.error("Error fetching jobs:", error)
        setError("Failed to load jobs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchJobs()
    }
  }, [user])

  
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.required_skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && job.status === "Active"
    if (activeTab === "expired") return matchesSearch && job.status === "Expired"
    if (activeTab === "draft") return matchesSearch && job.status === "Draft"

    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
      case "Expired":
        return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
      case "Draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
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
    return <AuthCheck requiredRole="recruiter" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
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
    <AuthCheck requiredRole="recruiter">
      <div className="container mx-auto p-6 bg-grid">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center">
              <Sparkles className="h-8 w-8 mr-2 text-primary" />
              Job Listings
            </h1>
            <p className="text-muted-foreground">Manage your job postings and track applications</p>
          </div>
          <Button
            asChild
            className="mt-4 md:mt-0 bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <Link href="/recruiter/jobs/new">Post New Job</Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search jobs by title, location, or skills"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full mb-6" onValueChange={setActiveTab}>
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
              All Jobs
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
              Active
            </TabsTrigger>
            <TabsTrigger value="expired" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
              Expired
            </TabsTrigger>
            <TabsTrigger value="draft" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
              Drafts
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card className="border-0 shadow-md rounded-xl overflow-hidden">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No jobs found matching your criteria</p>
                <Button
                  onClick={() => setSearchTerm("")}
                  className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.job_id} className="overflow-hidden border-0 shadow-md rounded-xl card-hover-effect">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold">{job.job_title}</h3>
                        <Badge variant="outline" className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Posted: {formatDate(job.posted_date)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Expires: {formatDate(job.expires_date)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-1 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                      >
                        <Link href={`/recruiter/jobs/${job.job_id}`}>
                          <Users className="h-4 w-4" />
                          {job.applicants} Applicants
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                      >
                        <Link href={`/recruiter/jobs/${job.job_id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {job.required_skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="mr-1 mb-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-primary" />
                      <span>{job.applicants} Applicants</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-primary" />
                      <span>{job.interviews} Interviews</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AuthCheck>
  )
}
