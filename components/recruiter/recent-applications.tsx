"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { getCandidates } from "@/lib/api"

export function RecentApplications() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applications, setApplications] = useState<any[]>([])

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

        const recentApplications = response.candidates.slice(0, 4).map((candidate, index) => {
          const date = new Date()
          date.setDate(date.getDate() - Math.floor(Math.random() * 30))

          return {
            id: index + 1,
            candidate_name: candidate.name,
            candidate_initials: getInitials(candidate.name),
            job_title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
            company: companies[Math.floor(Math.random() * companies.length)],
            applied_date: date.toISOString().split("T")[0],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            match_score: Math.floor(Math.random() * 20) + 75, 
          }
        })

        setApplications(recentApplications)
      } catch (error) {
        console.error("Error fetching applications:", error)
        setError("Failed to load recent applications")
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const getInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

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
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <Card className="border-0 shadow-md rounded-xl overflow-hidden">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No applications yet</p>
          <Button asChild className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all">
            <Link href="/recruiter/jobs/new">Post a Job</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="border-0 shadow-md rounded-xl overflow-hidden card-hover-effect">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {application.candidate_initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{application.candidate_name}</h3>
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
                      <Calendar className="h-3 w-3 mr-1" />
                      Applied on {formatDate(application.applied_date)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                >
                  <Link href={`/recruiter/applications/${application.id}`}>Review</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
