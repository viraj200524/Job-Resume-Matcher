"use client"

import { useState } from "react"
import { BarChart, CheckCircle, MapPin, Building, ChevronDown, ChevronUp, Briefcase } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts"
import { Button } from "./ui/button"

// Mock data
const mockMatchStats = {
  totalMatches: 42,
  highCompatibility: 15,
  topScore: 92,
}

const mockJobMatches = [
  {
    id: 1,
    position: "Senior Frontend Developer",
    company: "Tech Innovations Inc.",
    location: "San Francisco, CA",
    matchScore: 92,
    matchDetails: {
      skills: 95,
      experience: 90,
      education: 85,
      projects: 88,
    },
  },
  {
    id: 2,
    position: "Full Stack Developer",
    company: "Digital Solutions Ltd.",
    location: "New York, NY",
    matchScore: 87,
    matchDetails: {
      skills: 85,
      experience: 90,
      education: 80,
      projects: 92,
    },
  },
  {
    id: 3,
    position: "React Developer",
    company: "WebCraft Agency",
    location: "Austin, TX",
    matchScore: 85,
    matchDetails: {
      skills: 90,
      experience: 80,
      education: 85,
      projects: 85,
    },
  },
  {
    id: 4,
    position: "Frontend Engineer",
    company: "Innovative Tech Solutions",
    location: "Seattle, WA",
    matchScore: 82,
    matchDetails: {
      skills: 85,
      experience: 75,
      education: 90,
      projects: 80,
    },
  },
  {
    id: 5,
    position: "UI Developer",
    company: "Creative Digital Agency",
    location: "Chicago, IL",
    matchScore: 78,
    matchDetails: {
      skills: 80,
      experience: 70,
      education: 85,
      projects: 75,
    },
  },
  {
    id: 6,
    position: "JavaScript Developer",
    company: "Software Solutions Inc.",
    location: "Denver, CO",
    matchScore: 75,
    matchDetails: {
      skills: 80,
      experience: 65,
      education: 80,
      projects: 75,
    },
  },
  {
    id: 7,
    position: "Web Developer",
    company: "Tech Startups Co.",
    location: "Portland, OR",
    matchScore: 72,
    matchDetails: {
      skills: 75,
      experience: 70,
      education: 75,
      projects: 70,
    },
  },
]

const topMatchesData = mockJobMatches
  .slice(0, 10)
  .map((job) => ({
    name: job.position.length > 20 ? job.position.substring(0, 20) + "..." : job.position,
    score: job.matchScore,
  }))
  .sort((a, b) => a.score - b.score)

export default function CandidateMatches() {
  const [expandedJobId, setExpandedJobId] = useState(null)
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewTime, setInterviewTime] = useState("")
  const [interviewMessage, setInterviewMessage] = useState("")

  const toggleJobExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId)
  }

  const handleRequestInterview = (jobId) => {
    // In a real app, this would send the interview request
    alert(`Interview requested for job #${jobId} on ${interviewDate} at ${interviewTime}`)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Candidate Matches</h2>

      {/* Match Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Matches</p>
              <h3 className="text-3xl font-bold text-gray-800">{mockMatchStats.totalMatches}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">High Compatibility</p>
              <h3 className="text-3xl font-bold text-gray-800">{mockMatchStats.highCompatibility}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Match Score</p>
              <h3 className="text-3xl font-bold text-gray-800">{mockMatchStats.topScore}%</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <BarChart className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Matches Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Top Job Matches</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={topMatchesData}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            >
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#0088FE" barSize={30} radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Job Match Cards */}
      <div className="space-y-6">
        {mockJobMatches.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 cursor-pointer" onClick={() => toggleJobExpand(job.id)}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-xl font-medium text-gray-800">{job.position}</h3>
                    <div
                      className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                        job.matchScore >= 85
                          ? "bg-green-100 text-green-800"
                          : job.matchScore >= 75
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {job.matchScore}% Match
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mt-1 space-y-1 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-4 md:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      alert(`Applied to ${job.position}`)
                    }}
                  >
                    Apply Now
                  </Button>
                  {expandedJobId === job.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            {expandedJobId === job.id && (
              <div className="border-t border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Match Analysis</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          outerRadius={90}
                          data={[
                            { subject: "Skills", A: job.matchDetails.skills },
                            { subject: "Experience", A: job.matchDetails.experience },
                            { subject: "Education", A: job.matchDetails.education },
                            { subject: "Projects", A: job.matchDetails.projects },
                          ]}
                        >
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <Radar name="Match Score" dataKey="A" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Request Interview</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={interviewTime}
                          onChange={(e) => setInterviewTime(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows={3}
                          value={interviewMessage}
                          onChange={(e) => setInterviewMessage(e.target.value)}
                          placeholder="Introduce yourself and explain why you're interested in this position..."
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleRequestInterview(job.id)}
                        disabled={!interviewDate || !interviewTime}
                      >
                        Request Interview
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
