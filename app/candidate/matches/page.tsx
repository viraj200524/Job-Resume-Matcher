"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, MapPin, Search, Filter, ArrowUpDown, Sparkles, Loader2 } from 'lucide-react'
import Link from "next/link"
import { getCandidateMatches, getCandidateByEmail } from "@/lib/api"
import type { Score } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"
import { ResumeUploader } from "@/components/candidate/resume-uploader"

export default function CandidateMatches() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobMatches, setJobMatches] = useState<Score[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [needsResume, setNeedsResume] = useState(false)

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user || !user.email) return

      try {
        setLoading(true)
        
        
        let candidateResponse;
        try {
          candidateResponse = await getCandidateByEmail(user.email);
          
          if (!candidateResponse.candidate) {
            setNeedsResume(true);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching candidate by email:", error);
          setNeedsResume(true);
          setLoading(false);
          return;
        }
        
        const candidateId = candidateResponse.candidate.candidate_id;

        
        const response = await getCandidateMatches(candidateId)
        setJobMatches(response.matches)
      } catch (error) {
        console.error("Error fetching job matches:", error)
        setError("Failed to load job matches. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMatches()
    }
  }, [user])

  
  const filteredJobs = jobMatches.filter((job) => {
    const matchesSearch = 
      (job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (job.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (job.required_skills?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "high") return matchesSearch && job.eligibility_score >= 80
    if (activeTab === "medium") return matchesSearch && job.eligibility_score >= 60 && job.eligibility_score < 80
    if (activeTab === "low") return matchesSearch && job.eligibility_score < 60
    
    return matchesSearch
  })

  if (!user) {
    return <AuthCheck requiredRole="candidate" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading job matches...</p>
        </div>
      </div>
    )
  }

  if (needsResume) {
    return (
      <div className="container mx-auto p-6 bg-grid">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
                <p className="text-muted-foreground mb-6">
                  Please upload your resume to get personalized job matches
                </p>
              </div>
              <ResumeUploader />
              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground">
                  After uploading your resume, refresh the page to see your job matches.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-2"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
            Job Matches
          </h1>
          <p className="text-muted-foreground">Discover jobs that match your skills and experience</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search jobs by title, company, or skills"
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
            Sort by: Match Score
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full mb-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
          >
            All Matches
          </TabsTrigger>
          <TabsTrigger
            value="high"
            className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
          >
            High Matches (80%+)
          </TabsTrigger>
          <TabsTrigger
            value="medium"
            className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
          >
            Medium Matches (60-79%)
          </TabsTrigger>
          <TabsTrigger
            value="low"
            className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
          >
            Low Matches (&lt;60%)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        {filteredJobs.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-md">
            <p className="text-muted-foreground mb-4">No job matches found for your search criteria.</p>
            <Button
              onClick={() => setSearchTerm("")}
              className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.job_id} className="overflow-hidden border-0 shadow-md rounded-xl card-hover-effect">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{job.job_title}</h3>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {Math.round(job.eligibility_score)}% Match
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {job.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location || "Remote"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                    >
                      <Link href={`/candidate/jobs/${job.job_id}`}>View Details</Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                    >
                      <Link href={`/candidate/jobs/${job.job_id}/apply`}>Apply Now</Link>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {(job.required_skills || "").split(",").map((skill, index) => (
                        <Badge key={index} variant="secondary" className="mr-1 mb-1">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Match Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Skills</span>
                        <span>{Math.round(job.skill_score)}%</span>
                      </div>
                      <Progress
                        value={job.skill_score}
                        className="h-1 bg-gray-100"
                        indicatorClassName="bg-gradient-bg"
                      />
                      <div className="flex justify-between text-xs">
                        <span>Education</span>
                        <span>{Math.round(job.education_score)}%</span>
                      </div>
                      <Progress
                        value={job.education_score}
                        className="h-1 bg-gray-100"
                        indicatorClassName="bg-gradient-bg"
                      />
                      <div className="flex justify-between text-xs">
                        <span>Project Relevance</span>
                        <span>{Math.round(job.project_relevance_score)}%</span>
                      </div>
                      <Progress
                        value={job.project_relevance_score}
                        className="h-1 bg-gray-100"
                        indicatorClassName="bg-gradient-bg"
                      />
                      <div className="flex justify-between text-xs">
                        <span>Experience</span>
                        <span>{Math.round(job.experience_score)}%</span>
                      </div>
                      <Progress
                        value={job.experience_score}
                        className="h-1 bg-gray-100"
                        indicatorClassName="bg-gradient-bg"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
