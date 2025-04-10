"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Mail, Server, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

export default function EmailSettings() {
  const [formData, setFormData] = useState({
    smtpServer: "",
    port: "",
    email: "",
    password: "",
  })

  const [testStatus, setTestStatus] = useState(null) // null, 'success', 'error'
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      alert("Settings saved successfully!")
    }, 1500)
  }

  const handleTestConnection = () => {
    setIsTesting(true)
    setTestStatus(null)

    // Simulate API call
    setTimeout(() => {
      setIsTesting(false)
      // Randomly succeed or fail for demo purposes
      const success = Math.random() > 0.5
      setTestStatus(success ? "success" : "error")
    }, 2000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Email Settings</h2>

      {testStatus === "success" && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Connection successful! Your email settings are working correctly.
          </AlertDescription>
        </Alert>
      )}

      {testStatus === "error" && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Connection failed. Please check your settings and try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSave}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="smtpServer" className="flex items-center">
                  <Server className="h-4 w-4 mr-2 text-gray-500" />
                  SMTP Server
                </Label>
                <Input
                  id="smtpServer"
                  name="smtpServer"
                  placeholder="smtp.example.com"
                  value={formData.smtpServer}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port" className="flex items-center">
                  <Server className="h-4 w-4 mr-2 text-gray-500" />
                  Port
                </Label>
                <Input id="port" name="port" placeholder="587" value={formData.port} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center">
                <Lock className="h-4 w-4 mr-2 text-gray-500" />
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500">
                For Gmail accounts, you may need to use an app password instead of your regular password.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleTestConnection}
                disabled={isTesting || !formData.smtpServer || !formData.port || !formData.email || !formData.password}
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-800">Email Notification Settings</h3>
            <p className="mt-2 text-sm text-gray-600">
              These email settings will be used for sending notifications to candidates when:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc pl-5">
              <li>A new job match is found</li>
              <li>An employer views your resume</li>
              <li>An interview request is received</li>
              <li>Your application status changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
