"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { uploadResume } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a PDF file")
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
      const response = await uploadResume(file)
      clearInterval(progressInterval)
      setProgress(100)
      setUploadSuccess(true)

      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been processed and your profile has been updated.",
      })
    } catch (err) {
      clearInterval(progressInterval)
      setProgress(0)
      setError("Failed to upload resume. Please try again.")

      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!uploadSuccess ? (
        <>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload your resume</h3>
            <p className="text-sm text-muted-foreground mb-4">Supported format: PDF</p>
            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <Button asChild variant="outline" className="gap-2" disabled={uploading}>
              <label htmlFor="resume-upload">
                <Upload className="h-4 w-4" />
                Select File
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
                <span>Uploading...</span>
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
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Resume Uploaded</AlertTitle>
          <AlertDescription className="text-green-700">
            Your resume has been successfully uploaded and processed. Your profile has been updated with the extracted
            information.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
