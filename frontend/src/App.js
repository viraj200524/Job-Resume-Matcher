import { useState } from "react"
import Header from "./components/header"
import UploadResume from "./components/upload-resume"
import ResumeAnalysis from "./components/resume-analysis"
import CandidateMatches from "./components/candidate_matches"
import AllJobs from "./components/all_jobs"
import EmailSettings from "./components/email-settings"

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload")
  const [resumeUploaded, setResumeUploaded] = useState(false)

  const handleUploadSuccess = () => {
    setResumeUploaded(true)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="container mx-auto px-4 py-8">
        {activeTab === "upload" && <UploadResume onUploadSuccess={handleUploadSuccess} />}
        {activeTab === "analysis" && <ResumeAnalysis />}
        {activeTab === "matches" && <CandidateMatches />}
        {activeTab === "jobs" && <AllJobs resumeUploaded={resumeUploaded} />}
        {activeTab === "email" && <EmailSettings />}
      </div>
    </main>
  )
}