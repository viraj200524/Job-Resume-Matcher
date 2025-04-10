// API client for interacting with the Flask backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Types based on the Flask backend
export interface Candidate {
  candidate_id: number
  name: string
  email: string
  phone: string
  linkedin: string
  skills: string
  qualifications: string
  projects: string
  experience: string
}

export interface Job {
  job_id: number
  job_title: string
  company: string
  location: string
  required_skills: string
  experience: string
  qualifications: string
  responsibilities: string
  benefits: string
  other_details: string
}

export interface Score {
  score_id: number
  candidate_id: number
  job_id: number
  skill_score: number
  education_score: number
  project_relevance_score: number
  experience_score: number
  eligibility_score: number
  job_title?: string
  company?: string
  location?: string
}

export interface Application {
  application_id: number
  candidate_id: number
  job_id: number
  application_date: string
  status: string
  job_title?: string
  company?: string
  location?: string
}

export interface ResumeUploadResponse {
  message: string
  candidate_id: number
  parsed_data: any
}

export interface JobUploadResponse {
  message: string
  job_id: number
  parsed_data: any
}

// API functions
export async function getCandidates(): Promise<{ candidates: Candidate[] }> {
  const response = await fetch(`${API_BASE_URL}/candidates`)
  if (!response.ok) {
    throw new Error(`Failed to fetch candidates: ${response.statusText}`)
  }
  return response.json()
}

export async function getCandidate(id: number): Promise<{ candidate: Candidate }> {
  const response = await fetch(`${API_BASE_URL}/candidates/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch candidate: ${response.statusText}`)
  }
  return response.json()
}

export async function getCandidateByEmail(email: string): Promise<{ candidate: Candidate }> {
  const response = await fetch(`${API_BASE_URL}/candidates/email/${email}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch candidate: ${response.statusText}`)
  }
  return response.json()
}

export async function getJobs(): Promise<{ jobs: Job[] }> {
  const response = await fetch(`${API_BASE_URL}/jobs`)
  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.statusText}`)
  }
  return response.json()
}

export async function getJob(id: number): Promise<{ job: Job }> {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch job: ${response.statusText}`)
  }
  return response.json()
}

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/upload/resume`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload resume: ${response.statusText}`)
  }

  return response.json()
}

export async function uploadJobDescription(jobTitle: string, jobDescription: string): Promise<JobUploadResponse> {
  const response = await fetch(`${API_BASE_URL}/upload/job-description`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobTitle,
      jobDescription,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to upload job description: ${response.statusText}`)
  }

  return response.json()
}

export async function uploadJobCSV(file: File): Promise<JobUploadResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/upload/job-description`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload job CSV: ${response.statusText}`)
  }

  return response.json()
}

export async function getCandidateMatches(candidateId: number): Promise<{ matches: Score[] }> {
  const response = await fetch(`${API_BASE_URL}/match/${candidateId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch candidate matches: ${response.statusText}`)
  }
  return response.json()
}

export async function getTopMatches(candidateId: number, limit = 5): Promise<{ top_matches: Score[] }> {
  const response = await fetch(`${API_BASE_URL}/match/top/${candidateId}?limit=${limit}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch top matches: ${response.statusText}`)
  }
  return response.json()
}

export async function createApplication(candidateId: number, jobId: number): Promise<{ application_id: number }> {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      candidate_id: candidateId,
      job_id: jobId,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create application: ${response.statusText}`)
  }

  return response.json()
}

export async function getCandidateApplications(candidateId: number): Promise<{ applications: Application[] }> {
  const response = await fetch(`${API_BASE_URL}/applications/${candidateId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch candidate applications: ${response.statusText}`)
  }
  return response.json()
}
