"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Briefcase, Users, Video, FileText, CheckCircle2, Zap } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // // Redirect based on user role
        // if (user.role === "candidate") {
        //   router.push("/candidate/dashboard")
        // } else {
        //   router.push("/recruiter/dashboard")
        // }
      } else {
        // No user, redirect to login
        router.push("/login")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pattern-bg">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <div className="relative mb-8 w-full max-w-4xl">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-90 blur-xl"></div>
            <div className="relative rounded-2xl bg-white p-8 shadow-xl">
              <h1 className="text-5xl font-bold tracking-tight mb-4 text-shadow">
                Welcome to <span className="gradient-text">TalentMatch</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                AI-powered job matching platform that connects the right candidates with the right opportunities
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="border-0 shadow-lg card-shine card-hover-effect overflow-hidden rounded-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-bl-full"></div>
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">For Candidates</h2>
              <p className="text-muted-foreground mb-6">
                Find the perfect job match based on your skills and experience
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Resume Analysis</h3>
                    <p className="text-sm text-muted-foreground">Upload your resume and get AI-powered insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Job Match Scoring</h3>
                    <p className="text-sm text-muted-foreground">See how well you match with job opportunities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Video Interviews</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with recruiters through integrated video calls
                    </p>
                  </div>
                </div>
              </div>

              <Button
                asChild
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
              >
                <Link href="/candidate/dashboard">
                  Candidate Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg card-shine card-hover-effect overflow-hidden rounded-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-bl-full"></div>
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mb-6">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">For Recruiters</h2>
              <p className="text-muted-foreground mb-6">Find the best candidates for your open positions</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Candidate Matching</h3>
                    <p className="text-sm text-muted-foreground">AI-powered matching to find the best candidates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Analytics Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Visualize candidate data and application metrics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Video Interviews</h3>
                    <p className="text-sm text-muted-foreground">Schedule and conduct interviews with candidates</p>
                  </div>
                </div>
              </div>

              <Button
                asChild
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
              >
                <Link href="/recruiter/dashboard">
                  Recruiter Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl mb-16">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-1">
            <div className="bg-white p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6 text-center">Powered by AI</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border border-cyan-100 card-hover-effect">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Resume Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI extracts key skills and experience from resumes with high accuracy
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border border-cyan-100 card-hover-effect">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Job Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced algorithms match candidates to jobs with precision and speed
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border border-cyan-100 card-hover-effect">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mb-4">
                    <Video className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Video Interviews</h3>
                  <p className="text-sm text-muted-foreground">
                    Seamless video conferencing integration for remote interviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to transform your hiring process?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of companies and candidates who have already discovered the power of AI-driven job matching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
            >
              <Link href="/candidate/dashboard">I'm a Candidate</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
            >
              <Link href="/recruiter/dashboard">I'm a Recruiter</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
