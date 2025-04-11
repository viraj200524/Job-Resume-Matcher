"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, ArrowUpDown, Calendar, Building, Eye, Check, X, Sparkles } from "lucide-react"
import Link from "next/link"
import { getCandidates } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"

export default function RecruiterApplications() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        
        
        const response = await getCandidates()

        
        const statuses = ["Pending", "Reviewing", "Interview", "Rejected", "Offered"]
        const jobTitles = [
          "Senior Frontend Developer",
          "React Developer",
          "Full Stack Engineer",
          "UI/UX Developer",
          "Frontend Team Lead",
        ]
        const companies = [
          "Tech Solutions Inc.",
          "Digital Innovations",
          "WebTech Systems",
          "Creative Design Co.",
          "Innovative Solutions",
        ]

        const applications = response.candidates.map((candidate) => {
          
          const date = new Date()
          date.setDate(date.getDate() - Math.floor(Math.random() * 30))

          
          const status = statuses[Math.floor(Math.random() * statuses.length)]

          
          let interviewDate = null
          let interviewTime = null
          if (status === "Interview") {
            interviewDate = new Date()
            interviewDate.setDate(interviewDate.getDate() + Math.floor(Math.random() * 14) + 1)

            const times = ["10:00 AM", "2:30 PM", "4:00 PM"]
            interviewTime = times[Math.floor(Math.random() * times.length)]
          }

          return {
            id: candidate.candidate_id,
            candidate_name: candidate.name,
            candidate_initials: getInitials(candidate.name),
            job_title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
            company: companies[Math.floor(Math.random() * companies.length)],
            applied_date: date.toISOString().split("T")[0],
            status,
            match_score: Math.floor(Math.random() * 20) + 75, 
            interview_date: interviewDate ? interviewDate.toISOString().split("T")[0] : null,
            interview_time: interviewTime,
          }
        })

        setApplications(applications)
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

  
  const getInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  
  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.company.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "pending") return matchesSearch && application.status === "Pending"
    if (activeTab === "reviewing") return matchesSearch && application.status === "Reviewing"
    if (activeTab === "interview") return matchesSearch && application.status === "Interview"
    if (activeTab === "completed") return matchesSearch && ["Rejected", "Offered"].includes(application.status)

    return matchesSearch
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

  if (!user) {
    return <AuthCheck requiredRole="recruiter" />
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
    <AuthCheck requiredRole="recruiter">
      <div className="container mx-auto p-6 bg-grid">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center">
              <Sparkles className="h-8 w-8 mr-2 text-primary" />
              Applications
            </h1>
            <p className="text-muted-foreground">Manage and review job applications</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search applications by candidate or job"
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
              All Applications
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="reviewing"
              className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
            >
              Reviewing
            </TabsTrigger>
            <TabsTrigger
              value="interview"
              className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
            >
              Interview
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
            >
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card className="border-0 shadow-md rounded-xl overflow-hidden">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No applications found matching your criteria</p>
                <Button
                  onClick={() => setSearchTerm("")}
                  className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id} className="overflow-hidden border-0 shadow-md rounded-xl card-hover-effect">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {application.candidate_initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{application.candidate_name}</h3>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {application.match_score}% Match
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Applied for: {application.job_title}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {application.company}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Applied on {formatDate(application.applied_date)}
                          </div>
                          {application.interview_date && (
                            <div className="flex items-center text-green-600 font-medium">
                              <Calendar className="h-3 w-3 mr-1" />
                              Interview: {formatDate(application.interview_date)} at {application.interview_time}
                            </div>
                          )}
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
                        <Link href={`/recruiter/applications/${application.id}`}>
                          <Eye className="h-4 w-4" />
                          Review
                        </Link>
                      </Button>
                      {application.status === "Pending" && (
                        <>
                          <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-white">
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm" className="gap-1">
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      {application.status === "Reviewing" && (
                        <Button
                          asChild
                          size="sm"
                          className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                        >
                          <Link href={`/recruiter/applications/${application.id}/schedule`}>Schedule Interview</Link>
                        </Button>
                      )}
                      {application.status === "Interview" && (
                        <Button
                          asChild
                          size="sm"
                          className="gap-1 bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                        >
                          <Link href={`/recruiter/interviews/${application.id}`}>Join Interview</Link>
                        </Button>
                      )}
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
