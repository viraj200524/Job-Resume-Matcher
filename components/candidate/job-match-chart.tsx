"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface JobMatch {
  job_title: string
  company: string
  eligibility_score: number
  skill_score: number
  education_score: number
  project_relevance_score: number
  experience_score: number
}

export function CandidateJobMatchChart({ data }: { data: JobMatch[] }) {
  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">
            No job matches found. Complete your profile to get matched with jobs.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
          >
            <Link href="/candidate/profile">Complete Your Profile</Link>
          </Button>
        </div>
      ) : (
        data.map((job, index) => (
          <Card key={index} className="overflow-hidden border-0 shadow-md rounded-xl card-hover-effect">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                <div>
                  <h3 className="font-semibold">{job.job_title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {Math.round(job.eligibility_score)}%
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Skills</span>
                  <span>{Math.round(job.skill_score)}%</span>
                </div>
                <Progress
                  value={job.skill_score}
                  className="h-2 bg-gray-100"
                  indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-600"
                />

                <div className="flex justify-between text-sm">
                  <span>Education</span>
                  <span>{Math.round(job.education_score)}%</span>
                </div>
                <Progress
                  value={job.education_score}
                  className="h-2 bg-gray-100"
                  indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-600"
                />

                <div className="flex justify-between text-sm">
                  <span>Project Relevance</span>
                  <span>{Math.round(job.project_relevance_score)}%</span>
                </div>
                <Progress
                  value={job.project_relevance_score}
                  className="h-2 bg-gray-100"
                  indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-600"
                />

                <div className="flex justify-between text-sm">
                  <span>Experience</span>
                  <span>{Math.round(job.experience_score)}%</span>
                </div>
                <Progress
                  value={job.experience_score}
                  className="h-2 bg-gray-100"
                  indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-600"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200"
                >
                  <Link href={`/candidate/jobs/${index}`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
