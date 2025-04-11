"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCandidate, getCandidateMatches } from "@/lib/api"
import { Briefcase, Calendar, Download, FileText, Mail, Phone, User, Sparkles } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"

export default function CandidateProfile() {
  const { user } = useAuth()
  const params = useParams()
  const candidateId = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [candidate, setCandidate] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        
        const candidateResponse = await getCandidate(candidateId)
        setCandidate(candidateResponse.candidate)

        
        const matchesResponse = await getCandidateMatches(candidateId)
        setMatches(matchesResponse.matches || [])
      } catch (error) {
        console.error("Error fetching candidate data:", error)
        setError("Failed to load candidate data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (candidateId) {
      fetchData()
    }
  }, [candidateId])

  const getInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return <AuthCheck requiredRole="recruiter" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading candidate profile...</p>
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

  if (!candidate) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Candidate Not Found</h2>
          <p className="text-muted-foreground mb-4">We couldn't find this candidate in our system.</p>
          <Button asChild>
            <Link href="/recruiter/candidates">Back to Candidates</Link>
          </Button>
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
              Candidate Profile
            </h1>
            <p className="text-muted-foreground">Review candidate details and job matches</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button
              asChild
              variant="outline"
              className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
            >
              <Link href={`/recruiter/candidates/${candidateId}/interview`}>
                <Calendar className="h-4 w-4" />
                Schedule Interview
              </Link>
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
              <Download className="h-4 w-4" />
              Download Resume
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader className="pb-2">
                <CardTitle>Profile</CardTitle>
                <CardDescription>Candidate information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-24 w-24 border-2 border-primary/20 mb-4">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{candidate.name}</h2>
                  <p className="text-muted-foreground">Senior Frontend Developer</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20">Top Candidate</Badge>
                    <Badge variant="outline">
                      {matches.length > 0 ? `${Math.round(matches[0].eligibility_score)}% Match` : "New"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{candidate.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Experience</p>
                      <p className="text-sm text-muted-foreground">{candidate.experience || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">LinkedIn</p>
                      <p className="text-sm text-muted-foreground">{candidate.linkedin || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader className="pb-2">
                <CardTitle>Skills</CardTitle>
                <CardDescription>Technical expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills ? (
                    candidate.skills.split(",").map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="mb-1">
                        {skill.trim()}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills listed</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="resume" className="w-full">
              <TabsList className="mb-4 bg-white border shadow-sm">
                <TabsTrigger
                  value="resume"
                  className="data-[state=active]:bg-gradient-to-r from-blue-600 to-cyan-500 data-[state=active]:text-white"
                >
                  Resume
                </TabsTrigger>
                <TabsTrigger
                  value="matches"
                  className="data-[state=active]:bg-gradient-to-r from-blue-600 to-cyan-500 data-[state=active]:text-white"
                >
                  Job Matches
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="data-[state=active]:bg-gradient-to-r from-blue-600 to-cyan-500 data-[state=active]:text-white"
                >
                  Applications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="resume">
                <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
                  <CardHeader>
                    <CardTitle>Resume Details</CardTitle>
                    <CardDescription>Parsed from candidate's resume</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Experience</h3>
                      <div className="text-sm whitespace-pre-line">
                        {candidate.experience || "No experience information available"}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Education</h3>
                      <div className="text-sm whitespace-pre-line">
                        {candidate.qualifications || "No education information available"}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Projects</h3>
                      <div className="text-sm whitespace-pre-line">
                        {candidate.projects || "No project information available"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="matches">
                <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
                  <CardHeader>
                    <CardTitle>Job Matches</CardTitle>
                    <CardDescription>Best matching jobs for this candidate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {matches.length > 0 ? (
                      <div className="space-y-4">
                        {matches.map((match) => (
                          <div key={match.job_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{match.job_title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {match.company} • {match.location}
                                </p>
                              </div>
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                {Math.round(match.eligibility_score)}% Match
                              </Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                              <div className="border rounded p-2 text-center">
                                <p className="font-medium">Skills</p>
                                <p className="text-muted-foreground">{Math.round(match.skill_score)}%</p>
                              </div>
                              <div className="border rounded p-2 text-center">
                                <p className="font-medium">Education</p>
                                <p className="text-muted-foreground">{Math.round(match.education_score)}%</p>
                              </div>
                              <div className="border rounded p-2 text-center">
                                <p className="font-medium">Projects</p>
                                <p className="text-muted-foreground">{Math.round(match.project_relevance_score)}%</p>
                              </div>
                              <div className="border rounded p-2 text-center">
                                <p className="font-medium">Experience</p>
                                <p className="text-muted-foreground">{Math.round(match.experience_score)}%</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-1">No matches found</h3>
                        <p className="text-sm text-muted-foreground">
                          This candidate hasn't been matched with any jobs yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications">
                <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
                  <CardHeader>
                    <CardTitle>Applications</CardTitle>
                    <CardDescription>Jobs this candidate has applied for</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-1">No applications yet</h3>
                      <p className="text-sm text-muted-foreground">This candidate hasn't applied to any jobs yet.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthCheck>
  )
}
