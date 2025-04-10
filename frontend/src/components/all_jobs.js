import { useState } from "react"
import { Search, MapPin, Building, ChevronDown, ChevronUp, Clock, Filter, Briefcase } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

// Mock data
const mockJobs = [
  {
    id: 1,
    position: "Senior Frontend Developer",
    company: "Tech Innovations Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    posted: "2 days ago",
    description:
      "We are looking for an experienced Frontend Developer to join our team. You will be responsible for building and maintaining user interfaces for our web applications.",
    requirements: [
      "5+ years of experience with React",
      "Strong knowledge of JavaScript, HTML, and CSS",
      "Experience with state management libraries (Redux, MobX)",
      "Familiarity with modern frontend build pipelines and tools",
      "Experience with responsive design and cross-browser compatibility",
    ],
    matchScore: 92,
  },
  {
    id: 2,
    position: "Full Stack Developer",
    company: "Digital Solutions Ltd.",
    location: "New York, NY",
    type: "Full-time",
    salary: "$110,000 - $140,000",
    posted: "3 days ago",
    description:
      "We're seeking a Full Stack Developer to work on our enterprise applications. You'll be working with both frontend and backend technologies to deliver complete solutions.",
    requirements: [
      "4+ years of experience with full stack development",
      "Proficiency in React and Node.js",
      "Experience with database design and ORM frameworks",
      "Knowledge of RESTful API design principles",
      "Understanding of cloud services (AWS, Azure, or GCP)",
    ],
    matchScore: 87,
  },
  {
    id: 3,
    position: "React Developer",
    company: "WebCraft Agency",
    location: "Austin, TX",
    type: "Contract",
    salary: "$90 - $110 per hour",
    posted: "1 week ago",
    description:
      "Join our team as a React Developer to build modern, responsive web applications for our clients. You'll be working closely with designers and backend developers.",
    requirements: [
      "3+ years of experience with React",
      "Strong understanding of JavaScript fundamentals",
      "Experience with CSS preprocessors (Sass, Less)",
      "Familiarity with testing frameworks (Jest, React Testing Library)",
      "Knowledge of version control systems (Git)",
    ],
    matchScore: 85,
  },
  {
    id: 4,
    position: "Frontend Engineer",
    company: "Innovative Tech Solutions",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$100,000 - $130,000",
    posted: "5 days ago",
    description:
      "We are looking for a Frontend Engineer to join our product team. You will be responsible for implementing user interfaces and ensuring a great user experience.",
    requirements: [
      "3+ years of experience with modern JavaScript frameworks",
      "Strong knowledge of HTML, CSS, and responsive design",
      "Experience with frontend build tools (Webpack, Babel)",
      "Understanding of web accessibility standards",
      "Familiarity with UI/UX design principles",
    ],
    matchScore: 82,
  },
  {
    id: 5,
    position: "UI Developer",
    company: "Creative Digital Agency",
    location: "Chicago, IL",
    type: "Full-time",
    salary: "$90,000 - $120,000",
    posted: "1 week ago",
    description:
      "We're looking for a UI Developer to create beautiful, responsive user interfaces for our clients' web applications. You'll work closely with our design team.",
    requirements: [
      "3+ years of experience with HTML, CSS, and JavaScript",
      "Experience with modern CSS frameworks (Tailwind, Bootstrap)",
      "Knowledge of JavaScript frameworks (React preferred)",
      "Strong attention to detail and design sensibility",
      "Portfolio demonstrating UI development skills",
    ],
    matchScore: 78,
  },
]

export default function AllJobs({ resumeUploaded }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedJobId, setExpandedJobId] = useState(null)
  const [locationFilter, setLocationFilter] = useState("")
  const [companyFilter, setCompanyFilter] = useState("")

  const toggleJobExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId)
  }

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLocation = locationFilter === "" || job.location.toLowerCase().includes(locationFilter.toLowerCase())

    const matchesCompany = companyFilter === "" || job.company.toLowerCase().includes(companyFilter.toLowerCase())

    return matchesSearch && matchesLocation && matchesCompany
  })

  const getMatchScoreColor = (score) => {
    if (!score) return "bg-gray-100 text-gray-800"
    if (score >= 85) return "bg-green-100 text-green-800"
    if (score >= 75) return "bg-yellow-100 text-yellow-800"
    return "bg-orange-100 text-orange-800"
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Jobs</h2>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search jobs..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Filter by location..."
              className="pl-10"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>

          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Filter by company..."
              className="pl-10"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">{filteredJobs.length} jobs found</div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter size={16} />
            More Filters
          </Button>
        </div>
      </div>

      {/* Job Listings */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 cursor-pointer" onClick={() => toggleJobExpand(job.id)}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-xl font-medium text-gray-800">{job.position}</h3>
                      {resumeUploaded && (
                        <div
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getMatchScoreColor(job.matchScore)}`}
                        >
                          {job.matchScore ? `${job.matchScore}% Match` : "No Match Data"}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mt-1 space-y-1 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {job.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.type}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.posted}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        alert(`Applied to ${job.position}`)
                      }}
                    >
                      Apply Now
                    </Button>
                    {expandedJobId === job.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {expandedJobId === job.id && (
                <div className="border-t border-gray-200 p-6">
                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Description</h4>
                    <p className="text-gray-700">{job.description}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Requirements</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Salary</h4>
                    <p className="text-gray-700">{job.salary}</p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        alert(`Applied to ${job.position}`)
                      }}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-500 mb-2">No jobs found matching your criteria</div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setLocationFilter("")
              setCompanyFilter("")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
