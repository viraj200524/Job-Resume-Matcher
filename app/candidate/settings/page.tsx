"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { getCandidateByEmail } from "@/lib/api"
import type { Candidate } from "@/lib/api"
import { Sparkles } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function CandidateSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

    useEffect(() => {
      const fetchCandidate = async () => {
        if (!user?.email) return
  
        try {
          setLoading(true)
          const response = await getCandidateByEmail(user.email)
          setCandidate(response.candidate)
        } catch (error) {
          console.error("Error fetching candidate:", error)
          setError("Failed to load profile data. Please try again later.")
        } finally {
          setLoading(false)
        }
      }
  
      if (user) {
        fetchCandidate()
      }
    }, [user])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    
    
    setTimeout(() => {
      setSaving(false)
      toast({
        title: "Settings updated",
        description: "Your settings have been successfully updated.",
      })
    }, 1000)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 bg-grid">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center">
            <Sparkles className="h-8 w-8 mr-2 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6 bg-white border shadow-sm">
          <TabsTrigger value="account" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
            Account
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-gradient-bg data-[state=active]:text-white">
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <div className="space-y-6">
            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" defaultValue={candidate?.name || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        defaultValue={candidate?.email || ""}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+1 (555) 123-4567" defaultValue={candidate?.phone || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="San Francisco, CA" defaultValue="" />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                    disabled={saving}
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border border-destructive/20 rounded-lg">
                    <div>
                      <h3 className="font-medium">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="job-matches" className="font-medium">
                          Job Matches
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive notifications about new job matches</p>
                      </div>
                      <Switch id="job-matches" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="application-updates" className="font-medium">
                          Application Updates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when your application status changes
                        </p>
                      </div>
                      <Switch id="application-updates" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="interview-reminders" className="font-medium">
                          Interview Reminders
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive reminders about upcoming interviews</p>
                      </div>
                      <Switch id="interview-reminders" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing-emails" className="font-medium">
                          Marketing Emails
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive promotional emails and newsletters</p>
                      </div>
                      <Switch id="marketing-emails" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Frequency</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="immediate" name="frequency" className="text-primary" defaultChecked />
                        <Label htmlFor="immediate">Immediate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="daily" name="frequency" className="text-primary" />
                        <Label htmlFor="daily">Daily Digest</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="weekly" name="frequency" className="text-primary" />
                        <Label htmlFor="weekly">Weekly Digest</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                  onClick={(e) => {
                    e.preventDefault()
                    toast({
                      title: "Preferences saved",
                      description: "Your notification preferences have been updated.",
                    })
                  }}
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Profile Visibility</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="profile-visibility" className="font-medium">
                          Public Profile
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow recruiters to find your profile in searches
                        </p>
                      </div>
                      <Switch id="profile-visibility" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="contact-info" className="font-medium">
                          Contact Information
                        </Label>
                        <p className="text-sm text-muted-foreground">Show your contact information to recruiters</p>
                      </div>
                      <Switch id="contact-info" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="resume-visibility" className="font-medium">
                          Resume Visibility
                        </Label>
                        <p className="text-sm text-muted-foreground">Allow recruiters to download your resume</p>
                      </div>
                      <Switch id="resume-visibility" defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Data Usage</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="analytics" className="font-medium">
                          Analytics
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow us to collect anonymous usage data to improve our services
                        </p>
                      </div>
                      <Switch id="analytics" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="personalization" className="font-medium">
                          Personalization
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow us to use your data to personalize your experience
                        </p>
                      </div>
                      <Switch id="personalization" defaultChecked />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                  onClick={(e) => {
                    e.preventDefault()
                    toast({
                      title: "Privacy settings saved",
                      description: "Your privacy settings have been updated.",
                    })
                  }}
                >
                  Save Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden gradient-border">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the appearance of the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Theme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-primary">
                      <div className="w-full h-24 bg-white border rounded-md mb-2"></div>
                      <span>Light</span>
                    </div>
                    <div className="border rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-primary">
                      <div className="w-full h-24 bg-gray-900 border rounded-md mb-2"></div>
                      <span>Dark</span>
                    </div>
                    <div className="border rounded-lg p-4 flex flex-col items-center cursor-pointer hover:border-primary border-primary">
                      <div className="w-full h-24 bg-gradient-to-b from-white to-gray-900 border rounded-md mb-2"></div>
                      <span>System</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-gradient-bg text-white border-0 shadow-md hover:shadow-lg transition-all"
                  onClick={(e) => {
                    e.preventDefault()
                    toast({
                      title: "Appearance settings saved",
                      description: "Your appearance settings have been updated.",
                    })
                  }}
                >
                  Save Appearance Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
