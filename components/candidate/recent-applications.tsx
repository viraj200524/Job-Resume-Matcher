"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { getCandidateApplications } from "@/lib/api"
import type { Application } from "@/lib/api"

interface RecentApplicationsProps {
  candidateId: number
}

export function RecentApplications({ candidateId }: RecentApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await getCandidateApplications(candidateId)
        setApplications(response.applications)
      } catch (error) {
        console.error("Error fetching applications:", error)
        setError("Failed to load applications")
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [candidateId])

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

  return (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <Card className="border-0 shadow-md rounded-xl overflow-hidden">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No applications yet</p>
            <Button asChild className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all">
              <Link href="/candidate/matches">Browse Job Matches</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        applications.map((application) => (
          <Card
            key={application.application_id}
            className="border-0 shadow-md rounded-xl overflow-hidden card-hover-effect"
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="font-semibold">{application.job_title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {application.company} • {application.location || "Remote"}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Applied on {new Date(application.application_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-2 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(application.status)}>
                    {application.status}
                  </Badge>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                  >
                    <Link href={`/candidate/applications/${application.application_id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
