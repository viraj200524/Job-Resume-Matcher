import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { JobDescriptionUploader } from "@/components/recruiter/job-description-uploader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewJobPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Post New Job</h1>
          <p className="text-muted-foreground">Create a new job listing or upload from CSV</p>
        </div>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="upload">Upload CSV</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Enter the details of the job position</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input id="job-title" placeholder="e.g. Senior Frontend Developer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="e.g. Tech Innovations Inc." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g. San Francisco, CA or Remote" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Required</Label>
                    <Input id="experience" placeholder="e.g. 3+ years" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="required-skills">Required Skills</Label>
                  <Textarea id="required-skills" placeholder="e.g. React, TypeScript, Node.js, CSS" rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="e.g. Bachelor's degree in Computer Science or related field"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="Describe the key responsibilities of this role"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea id="benefits" placeholder="e.g. Health insurance, 401k, Remote work options" rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other-details">Other Details</Label>
                  <Textarea id="other-details" placeholder="Any additional information about the position" rows={3} />
                </div>

                <Button type="submit" className="w-full md:w-auto">
                  Post Job
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Job Descriptions</CardTitle>
              <CardDescription>Upload a CSV file with multiple job descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <JobDescriptionUploader />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
