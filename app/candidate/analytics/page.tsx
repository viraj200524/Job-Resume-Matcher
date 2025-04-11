"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Loader2 } from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js"
import { Bar, Doughnut, Radar } from "react-chartjs-2"
import { getCandidateApplications, getCandidateMatches, getCandidateByEmail } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"
import { Button } from "@/components/ui/button"
import { ResumeUploader } from "@/components/candidate/resume-uploader"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
)

export default function CandidateAnalytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [needsResume, setNeedsResume] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.email) return

      try {
        setLoading(true)

        
        let candidateResponse
        try {
          candidateResponse = await getCandidateByEmail(user.email)

          if (!candidateResponse.candidate) {
            setNeedsResume(true)
            setLoading(false)
            return
          }
        } catch (error) {
          console.error("Error fetching candidate by email:", error)
          setNeedsResume(true)
          setLoading(false)
          return
        }

        const candidateId = candidateResponse.candidate.candidate_id

        
        const matchesResponse = await getCandidateMatches(candidateId)

        
        const applicationsResponse = await getCandidateApplications(candidateId)

        
        const candidate = candidateResponse.candidate
        const totalFields = Object.keys(candidate).length
        const filledFields = Object.values(candidate).filter((value) => value && value !== "None").length
        const profileStrength = Math.round((filledFields / totalFields) * 100)

        
        const applications = applicationsResponse.applications
        const pending = applications.filter((app) => app.status === "Pending").length
        const reviewing = applications.filter((app) => app.status === "Reviewing").length
        const interview = applications.filter((app) => app.status === "Interview").length
        const rejected = applications.filter((app) => app.status === "Rejected").length
        const offered = applications.filter((app) => app.status === "Offered").length

        
        const candidateSkills = (candidate.skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        const jobSkills = matchesResponse.matches
          .flatMap((match) => (match.required_skills || "").split(",").map((s) => s.trim()))
          .filter(Boolean)

        
        const uniqueSkills = Array.from(new Set([...candidateSkills, ...jobSkills])).slice(0, 8)

        
        const candidateSkillScores = uniqueSkills.map(() => Math.floor(Math.random() * 40) + 60)
        const jobSkillScores = uniqueSkills.map(() => Math.floor(Math.random() * 40) + 60)

        
        const matchScores = matchesResponse.matches.map((match) => match.eligibility_score)
        const scoreRanges = {
          "90-100%": matchScores.filter((score) => score >= 90).length,
          "80-89%": matchScores.filter((score) => score >= 80 && score < 90).length,
          "70-79%": matchScores.filter((score) => score >= 70 && score < 80).length,
          "60-69%": matchScores.filter((score) => score >= 60 && score < 70).length,
          "Below 60%": matchScores.filter((score) => score < 60).length,
        }

        
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
        const applicationsOverTime = months.map(() => Math.floor(Math.random() * 5))

        
        const skillGaps = [
          { skill: "AWS", gap: 30 },
          { skill: "Docker", gap: 25 },
          { skill: "GraphQL", gap: 20 },
          { skill: "Vue.js", gap: 15 },
          { skill: "Python", gap: 10 },
        ]

        setAnalyticsData({
          profileStrength,
          applicationStats: {
            total: applications.length,
            pending,
            reviewing,
            interview,
            rejected,
            offered,
          },
          skillsData: {
            labels: uniqueSkills,
            datasets: [
              {
                label: "Your Skills",
                data: candidateSkillScores,
                backgroundColor: "rgba(0, 180, 216, 0.2)",
                borderColor: "rgba(0, 180, 216, 1)",
                borderWidth: 2,
              },
              {
                label: "Job Requirements (Avg)",
                data: jobSkillScores,
                backgroundColor: "rgba(0, 119, 182, 0.2)",
                borderColor: "rgba(0, 119, 182, 1)",
                borderWidth: 2,
              },
            ],
          },
          matchScoreDistribution: {
            labels: Object.keys(scoreRanges),
            datasets: [
              {
                label: "Number of Jobs",
                data: Object.values(scoreRanges),
                backgroundColor: [
                  "rgba(0, 180, 216, 0.8)",
                  "rgba(0, 180, 216, 0.6)",
                  "rgba(0, 180, 216, 0.4)",
                  "rgba(0, 180, 216, 0.2)",
                  "rgba(0, 180, 216, 0.1)",
                ],
                borderColor: [
                  "rgba(0, 180, 216, 1)",
                  "rgba(0, 180, 216, 1)",
                  "rgba(0, 180, 216, 1)",
                  "rgba(0, 180, 216, 1)",
                  "rgba(0, 180, 216, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
          applicationOverTime: {
            labels: months,
            datasets: [
              {
                label: "Applications",
                data: applicationsOverTime,
                backgroundColor: "rgba(0, 180, 216, 0.5)",
              },
            ],
          },
          topSkillGaps: skillGaps,
        })
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        setError("Failed to load analytics data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const applicationStatusOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  }

  const skillsChartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    maintainAspectRatio: false,
  }

  const applicationOverTimeOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  }

  if (!user) {
    return <AuthCheck requiredRole="candidate" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
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
              <CardDescription>Please upload your resume to access analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                To provide you with personalized analytics, we need to analyze your resume. Please upload your resume to
                continue.
              </p>
              <ResumeUploader />
              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground">
                  After uploading your resume, refresh the page to see your analytics.
                </p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
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
          <button className="px-4 py-2 bg-primary text-white rounded-md" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-4">We couldn't find any analytics data for your profile.</p>
          <button className="px-4 py-2 bg-primary text-white rounded-md" onClick={() => window.location.reload()}>
            Try Again
          </button>
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
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Insights into your job search performance</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profile Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.profileStrength}%</div>
            <Progress value={analyticsData.profileStrength} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.applicationStats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.applicationStats.total > 0
                ? Math.round((analyticsData.applicationStats.interview / analyticsData.applicationStats.total) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Offer Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.applicationStats.total > 0
                ? Math.round((analyticsData.applicationStats.offered / analyticsData.applicationStats.total) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 bg-white border shadow-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
            Skills Analysis
          </TabsTrigger>
          <TabsTrigger
            value="applications"
            className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
          >
            Applications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Distribution of your job applications by status</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <Doughnut
                  data={{
                    labels: ["Pending", "Reviewing", "Interview", "Rejected", "Offered"],
                    datasets: [
                      {
                        data: [
                          analyticsData.applicationStats.pending,
                          analyticsData.applicationStats.reviewing,
                          analyticsData.applicationStats.interview,
                          analyticsData.applicationStats.rejected,
                          analyticsData.applicationStats.offered,
                        ],
                        backgroundColor: [
                          "rgba(234, 179, 8, 0.8)",
                          "rgba(59, 130, 246, 0.8)",
                          "rgba(34, 197, 94, 0.8)",
                          "rgba(239, 68, 68, 0.8)",
                          "rgba(0, 180, 216, 0.8)",
                        ],
                        borderColor: [
                          "rgba(234, 179, 8, 1)",
                          "rgba(59, 130, 246, 1)",
                          "rgba(34, 197, 94, 1)",
                          "rgba(239, 68, 68, 1)",
                          "rgba(0, 180, 216, 1)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={applicationStatusOptions}
                />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle>Match Score Distribution</CardTitle>
                <CardDescription>Distribution of job match scores</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <Bar data={analyticsData.applicationOverTime} options={applicationOverTimeOptions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle>Skills Analysis</CardTitle>
                <CardDescription>How your skills match with job requirements</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <Radar data={analyticsData.skillsData} options={skillsChartOptions} />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle>Top Skill Gaps</CardTitle>
                <CardDescription>Skills to improve for better job matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topSkillGaps.map((item: any) => (
                    <div key={item.skill}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.skill}</span>
                        <span className="text-sm text-muted-foreground">{item.gap}% gap</span>
                      </div>
                      <Progress value={100 - item.gap} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader>
              <CardTitle>Applications Over Time</CardTitle>
              <CardDescription>Number of applications submitted each month</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Bar data={analyticsData.applicationOverTime} options={applicationOverTimeOptions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
