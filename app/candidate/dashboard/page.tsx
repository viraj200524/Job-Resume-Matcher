"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Briefcase, FileText, Video, Sparkles, Loader2 } from 'lucide-react'
import Link from "next/link"
import { CandidateJobMatchChart } from "@/components/candidate/job-match-chart"
import { CandidateSkillsRadarChart } from "@/components/candidate/skills-radar-chart"
import { RecentApplications } from "@/components/candidate/recent-applications"
import { UpcomingInterviews } from "@/components/candidate/upcoming-interviews"
import { getTopMatches, getCandidateApplications, getCandidateByEmail } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"
import { ResumeUploader } from "@/components/candidate/resume-uploader"

export default function CandidateDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [candidateData, setCandidateData] = useState({
    name: "",
    profileCompletion: 0,
    matchedJobs: 0,
    applications: 0,
    interviews: 0,
    topMatches: [],
    candidateId: null as number | null,
  })
  const [needsResume, setNeedsResume] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
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

        let matchesResponse = { top_matches: [] };
        try {
          matchesResponse = await getTopMatches(candidateId);
        } catch (error) {
          console.error("Error fetching top matches:", error);
        }

        let applicationsResponse = { applications: [] };
        try {
          applicationsResponse = await getCandidateApplications(candidateId);
        } catch (error) {
          console.error("Error fetching applications:", error);
        }

        const candidate = candidateResponse.candidate;
        const totalFields = Object.keys(candidate).length;
        const filledFields = Object.values(candidate).filter((value) => value && value !== "None").length;
        const profileCompletion = Math.round((filledFields / totalFields) * 100);

        const interviews = applicationsResponse.applications.filter((app) => app.status === "Interview").length;

        setCandidateData({
          name: candidate.name || user.name,
          profileCompletion,
          matchedJobs: matchesResponse.top_matches.length,
          applications: applicationsResponse.applications.length,
          interviews,
          topMatches: matchesResponse.top_matches,
          candidateId: candidateId,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (!user) {
    return <AuthCheck requiredRole="candidate" />;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (needsResume) {
    return (
      <div className="container mx-auto p-6 bg-grid">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Complete Your Profile
              </CardTitle>
              <CardDescription>
                Please upload your resume to get started with job matching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                To provide you with personalized job matches, we need to analyze your resume. 
                Please upload your resume to continue.
              </p>
              <ResumeUploader />
              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground">
                  After uploading your resume, refresh the page to see your dashboard.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-2"
                >
                  Refresh Dashboard
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
    );
  }

  return (
    <AuthCheck requiredRole="candidate">
      <div className="container mx-auto p-6 bg-grid">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center">
              <Sparkles className="h-8 w-8 mr-2 text-primary" />
              Welcome back, {candidateData.name}
            </h1>
            <p className="text-muted-foreground">Here's an overview of your job search progress</p>
          </div>
          <Button
            asChild
            className="mt-4 md:mt-0 bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <Link href="/candidate/profile">
              Complete Your Profile <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidateData.profileCompletion}%</div>
              <Progress value={candidateData.profileCompletion} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                Matched Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{candidateData.matchedJobs}</div>
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{candidateData.applications}</div>
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
                Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{candidateData.interviews}</div>
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
                Top Job Matches
              </CardTitle>
              <CardDescription>Jobs that best match your skills and experience</CardDescription>
            </CardHeader>
            <CardContent>
              <CandidateJobMatchChart data={candidateData.topMatches} />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Skills Analysis
              </CardTitle>
              <CardDescription>How your skills match with job requirements</CardDescription>
            </CardHeader>
            <CardContent>
              {candidateData.candidateId ? (
                <CandidateSkillsRadarChart candidateId={candidateData.candidateId} />
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground text-sm">No skills data available</p>
                </div>
              )}
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
            <TabsTrigger
              value="interviews"
              className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
            >
              Upcoming Interviews
            </TabsTrigger>
          </TabsList>
          <TabsContent value="applications">
            {candidateData.candidateId ? (
              <RecentApplications candidateId={candidateData.candidateId} />
            ) : (
              <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No application data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="interviews">
            {candidateData.candidateId ? (
              <UpcomingInterviews candidateId={candidateData.candidateId} />
            ) : (
              <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No interview data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthCheck>
  );
}
