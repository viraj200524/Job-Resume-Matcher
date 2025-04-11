"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, ArrowUpDown, Eye, Star, StarOff, Sparkles } from "lucide-react"
import Link from "next/link"
import { getCandidates } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"

export default function RecruiterCandidates() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [starredCandidates, setStarredCandidates] = useState<number[]>([])

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true)
        const response = await getCandidates()

        
        const jobTitles = [
          "Senior Frontend Developer",
          "React Developer",
          "Full Stack Engineer",
          "UI/UX Developer",
          "Frontend Team Lead",
        ]

        const statuses = ["Applied", "Reviewing", "Interview", "Rejected", "Offered"]

        const transformedCandidates = response.candidates.map((candidate) => {
          
          const matchScore = Math.floor(Math.random() * 20) + 75

          return {
            ...candidate,
            initials: getInitials(candidate.name),
            email: candidate.email || `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            location: "San Francisco, CA", 
            skills: (candidate.skills || "React, JavaScript, TypeScript, CSS").split(",").map((s: string) => s.trim()),
            experience: candidate.experience || "5 years",
            match_score: matchScore,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            job_title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
            starred: false,
          }
        })

        setCandidates(transformedCandidates)
      } catch (error) {
        console.error("Error fetching candidates:", error)
        setError("Failed to load candidates. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchCandidates()
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

  const toggleStar = (candidateId: number) => {
    if (starredCandidates.includes(candidateId)) {
      setStarredCandidates(starredCandidates.filter((id) => id !== candidateId))
    } else {
      setStarredCandidates([...starredCandidates, candidateId])
    }
  }

  
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      candidate.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.job_title.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "starred") return matchesSearch && starredCandidates.includes(candidate.candidate_id)
    if (activeTab === "applied") return matchesSearch && candidate.status === "Applied"
    if (activeTab === "reviewing") return matchesSearch && candidate.status === "Reviewing"
    if (activeTab === "interview") return matchesSearch && candidate.status === "Interview"

    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
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

  if (!user) {
    return <AuthCheck requiredRole="recruiter" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading candidates...</p>
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
              Candidates
            </h1>
            <p className="text-muted-foreground">Browse and manage candidates for your job openings</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search candidates by name, skills, or location"
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
              All Candidates
            </TabsTrigger>
            <TabsTrigger value="starred" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
              Starred
            </TabsTrigger>
            <TabsTrigger value="applied" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
              Applied
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
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filteredCandidates.length === 0 ? (
            <Card className="border-0 shadow-md rounded-xl overflow-hidden">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No candidates found matching your criteria</p>
                <Button
                  onClick={() => setSearchTerm("")}
                  className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredCandidates.map((candidate) => (
              <Card
                key={candidate.candidate_id}
                className="overflow-hidden border-0 shadow-md rounded-xl card-hover-effect"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary">{candidate.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{candidate.name}</h3>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {candidate.match_score}% Match
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(candidate.status)}>
                            {candidate.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {candidate.experience} • {candidate.location}
                        </p>
                        <p className="text-sm text-muted-foreground">For: {candidate.job_title}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="mr-1 mb-1">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => toggleStar(candidate.candidate_id)}
                      >
                        {starredCandidates.includes(candidate.candidate_id) ? (
                          <Star className="h-5 w-5 fill-primary text-primary" />
                        ) : (
                          <StarOff className="h-5 w-5" />
                        )}
                      </Button>
                      <Button asChild variant="outline" size="sm" className="gap-1">
                        <Link href={`/recruiter/candidates/${candidate.candidate_id}`}>
                          <Eye className="h-4 w-4" />
                          View Profile
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                      >
                        <Link href={`/recruiter/candidates/${candidate.candidate_id}/interview`}>
                          Schedule Interview
                        </Link>
                      </Button>
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
