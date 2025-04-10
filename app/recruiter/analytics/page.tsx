"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles } from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js"
import { Bar, Doughnut, Line } from "react-chartjs-2"
import { getCandidates, getJobs } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { AuthCheck } from "@/components/auth-check"
import { Button } from "@/components/ui/button"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

export default function RecruiterAnalytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch candidates and jobs
        const candidatesResponse = await getCandidates()
        const jobsResponse = await getJobs()

        // Calculate job stats
        const jobStats = {
          active: Math.floor(jobsResponse.jobs.length * 0.6),
          expired: Math.floor(jobsResponse.jobs.length * 0.3),
          draft: Math.floor(jobsResponse.jobs.length * 0.1),
        }

        // Generate random application stats
        const totalApplications = candidatesResponse.candidates.length * 3
        const applicationStats = {
          total: totalApplications,
          pending: Math.floor(totalApplications * 0.25),
          reviewing: Math.floor(totalApplications * 0.35),
          interview: Math.floor(totalApplications * 0.2),
          rejected: Math.floor(totalApplications * 0.15),
          offered: Math.floor(totalApplications * 0.05),
        }

        // Generate application by job data
        const jobTitles = jobsResponse.jobs.slice(0, 5).map((job: any) => job.job_title)
        const applicationsByJob = {
          labels: jobTitles,
          datasets: [
            {
              label: "Applications",
              data: jobTitles.map(() => Math.floor(Math.random() * 15) + 5),
              backgroundColor: "rgba(0, 180, 216, 0.5)",
            },
          ],
        }

        // Generate applications over time data
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
        const applicationsOverTime = {
          labels: months,
          datasets: [
            {
              label: "Applications",
              data: months.map(() => Math.floor(Math.random() * 15) + 5),
              borderColor: "rgba(0, 180, 216, 1)",
              backgroundColor: "rgba(0, 180, 216, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        }

        // Generate candidate source distribution data
        const candidateSourceDistribution = {
          labels: ["Job Board", "LinkedIn", "Referral", "Company Website", "Other"],
          datasets: [
            {
              data: [35, 25, 20, 15, 5],
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
        }

        // Generate time to hire data
        const timeToHire = {
          labels: jobTitles.slice(0, 4),
          datasets: [
            {
              label: "Days to Hire",
              data: [25, 18, 30, 22],
              backgroundColor: "rgba(0, 180, 216, 0.5)",
            },
          ],
        }

        setAnalyticsData({
          jobStats,
          applicationStats,
          applicationsByJob,
          applicationsOverTime,
          candidateSourceDistribution,
          timeToHire,
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

  const applicationsByJobOptions = {
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

  const applicationsOverTimeOptions = {
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

  const timeToHireOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Days",
        },
      },
    },
  }

  if (!user) {
    return <AuthCheck requiredRole="recruiter" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics data...</p>
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

  if (!analyticsData) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-4">We couldn't find any analytics data.</p>
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
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">Insights into your recruitment activities</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.jobStats.active + analyticsData.jobStats.expired + analyticsData.jobStats.draft}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsData.jobStats.active} active, {analyticsData.jobStats.expired} expired,{" "}
                {analyticsData.jobStats.draft} draft
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.applicationStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {analyticsData.applicationsByJob.labels.length} job positions
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((analyticsData.applicationStats.interview / analyticsData.applicationStats.total) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsData.applicationStats.interview} interviews scheduled
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Offer Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((analyticsData.applicationStats.offered / analyticsData.applicationStats.total) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsData.applicationStats.offered} offers extended
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4 bg-white border shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
            >
              Applications
            </TabsTrigger>
            <TabsTrigger value="hiring" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
              Hiring Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>Distribution of applications by status</CardDescription>
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
                  <CardTitle>Candidate Sources</CardTitle>
                  <CardDescription>Where candidates are coming from</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <Doughnut data={analyticsData.candidateSourceDistribution} options={applicationStatusOptions} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
                <CardHeader>
                  <CardTitle>Applications by Job</CardTitle>
                  <CardDescription>Number of applications per job posting</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <Bar data={analyticsData.applicationsByJob} options={applicationsByJobOptions} />
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
                <CardHeader>
                  <CardTitle>Applications Over Time</CardTitle>
                  <CardDescription>Application trends over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <Line data={analyticsData.applicationsOverTime} options={applicationsOverTimeOptions} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hiring">
            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle>Time to Hire</CardTitle>
                <CardDescription>Average days from job posting to offer acceptance</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <Bar data={analyticsData.timeToHire} options={timeToHireOptions} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthCheck>
  )
}
