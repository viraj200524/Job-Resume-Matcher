"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { uploadResume } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { FileText, Upload, X, Check, Loader2 } from "lucide-react"

export function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const { toast } = useToast()
  const { user, setUser } = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
      setUploadSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      const response = await uploadResume(file)

      // Update user with candidate ID if available
      if (response.candidate_id && user) {
        setUser({
          ...user,
          id: response.candidate_id,
        })
      }

      setUploadSuccess(true)
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been processed and your profile has been updated.",
      })
    } catch (error) {
      console.error("Error uploading resume:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setUploadSuccess(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="resume-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
            file ? "border-primary/50 bg-primary/5" : "border-gray-300"
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {!file ? (
              <>
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}
          </div>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {file && (
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
            disabled={uploading || uploadSuccess}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Uploaded
              </>
            ) : (
              "Upload Resume"
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={handleRemoveFile} disabled={uploading}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {uploadSuccess && (
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            <p className="text-sm">Resume processed successfully! Your profile has been updated.</p>
          </div>
        </Card>
      )}

      <div className="text-xs text-muted-foreground mt-2">
        <p>
          Uploading your resume will automatically extract your skills, experience, and qualifications to enhance your
          job matching.
        </p>
      </div>
    </div>
  )
}
