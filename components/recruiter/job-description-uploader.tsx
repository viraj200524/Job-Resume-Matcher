"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, Upload, CheckCircle, AlertCircle, Download } from "lucide-react"
import { uploadJobCSV } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function JobDescriptionUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [processedJobs, setProcessedJobs] = useState<{ job_id: number; job_title: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv") {
        setError("Please upload a CSV file")
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)
    setError(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 100)

    try {
      const response = await uploadJobCSV(file)
      clearInterval(progressInterval)
      setProgress(100)
      setUploadSuccess(true)
      setProcessedJobs(response.processed_jobs || [])

      toast({
        title: "Jobs uploaded successfully",
        description: `Processed ${response.processed_jobs?.length || 0} jobs from CSV.`,
      })
    } catch (err) {
      clearInterval(progressInterval)
      setProgress(0)
      setError("Failed to upload job descriptions. Please try again.")

      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your job descriptions. Please try again.",
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent =
      'Job Title,Job Description\nSenior Frontend Developer,"We are looking for a Senior Frontend Developer with experience in React, TypeScript, and modern web technologies."\nFull Stack Engineer,"We are seeking a Full Stack Engineer with experience in Node.js, React, and database technologies."'
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "job_descriptions_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {!uploadSuccess ? (
        <>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload job descriptions CSV</h3>
            <p className="text-sm text-muted-foreground mb-4">
              CSV should have columns for "Job Title" and "Job Description"
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 mb-4">
              <Button variant="outline" className="gap-2" onClick={downloadTemplate}>
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <Button asChild variant="outline" className="gap-2" disabled={uploading}>
              <label htmlFor="csv-upload">
                <Upload className="h-4 w-4" />
                Select CSV File
              </label>
            </Button>
          </div>

          {file && (
            <div className="bg-muted p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button onClick={handleUpload} disabled={uploading} size="sm">
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading and processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Jobs Uploaded Successfully</AlertTitle>
            <AlertDescription className="text-green-700">
              {processedJobs.length} job descriptions have been processed and added to your job listings.
            </AlertDescription>
          </Alert>

          {processedJobs.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Processed Jobs:</h3>
              <ul className="space-y-2">
                {processedJobs.map((job) => (
                  <li key={job.job_id} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span>{job.job_title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <Button asChild>
              <a href="/recruiter/jobs">View All Jobs</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
