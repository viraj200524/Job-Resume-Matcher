"use client"

import { useEffect, useState } from "react"
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js"
import { Radar } from "react-chartjs-2"
import { getCandidate, getTopMatches } from "@/lib/api"

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface SkillsRadarChartProps {
  candidateId: number
}

export function CandidateSkillsRadarChart({ candidateId }: SkillsRadarChartProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [skillsData, setSkillsData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch candidate details
        const candidateResponse = await getCandidate(candidateId)

        // Fetch top matches to get job requirements
        const matchesResponse = await getTopMatches(candidateId)

        // Extract skills from candidate
        const candidateSkills = candidateResponse.candidate.skills || ""
        const candidateSkillsList = candidateSkills.split(",").map((skill) => skill.trim())

        // Extract skills from job requirements
        const jobSkills = matchesResponse.top_matches.map((match) => match.required_skills || "")
        const allJobSkills = jobSkills
          .join(",")
          .split(",")
          .map((skill) => skill.trim())

        // Get unique skills from both candidate and jobs
        const uniqueSkills = Array.from(new Set([...candidateSkillsList, ...allJobSkills]))
          .filter((skill) => skill) // Remove empty strings
          .slice(0, 8) // Limit to 8 skills for better visualization

        // Generate random scores for demonstration
        // In a real app, you would calculate these scores based on actual data
        const candidateScores = uniqueSkills.map(() => Math.floor(Math.random() * 40) + 60)
        const jobScores = uniqueSkills.map(() => Math.floor(Math.random() * 40) + 60)

        setSkillsData({
          labels: uniqueSkills,
          datasets: [
            {
              label: "Your Skills",
              data: candidateScores,
              backgroundColor: "rgba(0, 180, 216, 0.2)",
              borderColor: "rgba(0, 180, 216, 1)",
              borderWidth: 2,
            },
            {
              label: "Job Requirements (Avg)",
              data: jobScores,
              backgroundColor: "rgba(0, 119, 182, 0.2)",
              borderColor: "rgba(0, 119, 182, 1)",
              borderWidth: 2,
            },
          ],
        })
      } catch (error) {
        console.error("Error fetching skills data:", error)
        setError("Failed to load skills data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [candidateId])

  const options = {
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

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground text-center">{error}</p>
      </div>
    )
  }

  if (!skillsData) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground text-center">No skills data available</p>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <Radar data={skillsData} options={options} />
    </div>
  )
}
