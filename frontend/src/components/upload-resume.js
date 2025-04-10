"use client"

import { useState } from "react"
import { Upload, CheckCircle, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

export default function UploadResume({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState(null) // 'success', 'error', null

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "application/pdf") {
      handleFileSelected(droppedFile)
    } else {
      setUploadStatus("error")
      setTimeout(() => setUploadStatus(null), 3000)
    }
  }

  const handleFileSelected = (selectedFile) => {
    setFile(selectedFile)
    simulateUpload()
  }

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      handleFileSelected(selectedFile)
    }
  }

  const simulateUpload = () => {
    setUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          setUploadStatus("success")
          onUploadSuccess()
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Your Resume</h2>

      {uploadStatus === "success" && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Resume uploaded successfully! You can now view your analysis.
          </AlertDescription>
        </Alert>
      )}

      {uploadStatus === "error" && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">Only PDF files are supported. Please try again.</AlertDescription>
        </Alert>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-blue-100 rounded-full">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-700">{file ? file.name : "Drag & drop your resume here"}</h3>
          <p className="text-sm text-gray-500">{file ? "File selected" : "or click to browse (PDF only)"}</p>
          <input type="file" accept=".pdf" className="hidden" id="resume-upload" onChange={handleFileInputChange} />
          {!file && (
            <label
              htmlFor="resume-upload"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Select File
            </label>
          )}
        </div>
      </div>

      {uploading && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="mt-10 bg-blue-50 border border-blue-100 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-800">How it works</h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>1. Upload your resume in PDF format</li>
              <li>2. Our system will analyze your skills, experience, and qualifications</li>
              <li>3. View a detailed breakdown of your professional profile</li>
              <li>4. Get matched with compatible job opportunities</li>
              <li>5. Apply directly to positions that interest you</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
