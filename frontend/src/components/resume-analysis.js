"use client"

import { useState } from "react"
import { BarChart3, Briefcase, GraduationCap, Mail, Phone, Linkedin, User, Calendar, Code } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

// Mock data
const mockPersonalInfo = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "+1 (555) 123-4567",
  linkedin: "linkedin.com/in/alexjohnson",
}

const mockSkills = [
  { name: "React", level: 90, category: "Frontend" },
  { name: "JavaScript", level: 85, category: "Frontend" },
  { name: "Node.js", level: 75, category: "Backend" },
  { name: "Python", level: 70, category: "Backend" },
  { name: "SQL", level: 80, category: "Database" },
  { name: "MongoDB", level: 65, category: "Database" },
  { name: "AWS", level: 60, category: "DevOps" },
  { name: "Docker", level: 55, category: "DevOps" },
  { name: "Git", level: 85, category: "Tools" },
  { name: "Agile", level: 75, category: "Methodology" },
]

const mockExperience = [
  {
    id: 1,
    role: "Senior Frontend Developer",
    company: "Tech Innovations Inc.",
    period: "Jan 2020 - Present",
    description:
      "Led development of responsive web applications using React and Redux. Improved site performance by 40%.",
  },
  {
    id: 2,
    role: "Frontend Developer",
    company: "Digital Solutions Ltd.",
    period: "Mar 2017 - Dec 2019",
    description:
      "Developed and maintained client websites. Collaborated with design team to implement UI/UX improvements.",
  },
  {
    id: 3,
    role: "Junior Web Developer",
    company: "WebCraft Agency",
    period: "Jun 2015 - Feb 2017",
    description:
      "Created responsive websites for clients across various industries. Assisted senior developers with code reviews.",
  },
]

const mockEducation = [
  {
    degree: "Master of Computer Science",
    institution: "Tech University",
    year: "2015",
  },
  {
    degree: "Bachelor of Science in Information Technology",
    institution: "State University",
    year: "2013",
  },
]

const mockProjects = [
  {
    title: "E-commerce Platform",
    description: "Built a full-stack e-commerce platform with React, Node.js, and MongoDB",
    technologies: ["React", "Node.js", "Express", "MongoDB", "Redux"],
  },
  {
    title: "Task Management App",
    description: "Developed a collaborative task management application with real-time updates",
    technologies: ["React", "Firebase", "Material UI", "Redux"],
  },
  {
    title: "Data Visualization Dashboard",
    description: "Created an interactive dashboard for visualizing complex datasets",
    technologies: ["D3.js", "React", "TypeScript", "REST API"],
  },
]

const completenessData = [
  { name: "Complete", value: 85 },
  { name: "Incomplete", value: 15 },
]

const COLORS = ["#0088FE", "#EEEEEE"]

export default function ResumeAnalysis() {
  const [selectedSkillCategory, setSelectedSkillCategory] = useState("All")

  const categories = ["All", ...new Set(mockSkills.map((skill) => skill.category))]

  const filteredSkills =
    selectedSkillCategory === "All"
      ? mockSkills
      : mockSkills.filter((skill) => skill.category === selectedSkillCategory)

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Resume Analysis</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Personal Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-600" />
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-10 flex-shrink-0 text-gray-500">
                <User className="h-4 w-4" />
              </div>
              <span className="text-gray-800">{mockPersonalInfo.name}</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 flex-shrink-0 text-gray-500">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-gray-800">{mockPersonalInfo.email}</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 flex-shrink-0 text-gray-500">
                <Phone className="h-4 w-4" />
              </div>
              <span className="text-gray-800">{mockPersonalInfo.phone}</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 flex-shrink-0 text-gray-500">
                <Linkedin className="h-4 w-4" />
              </div>
              <span className="text-gray-800">{mockPersonalInfo.linkedin}</span>
            </div>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
            Profile Completeness
          </h3>
          <div className="flex flex-col items-center">
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completenessData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {completenessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <div className="text-3xl font-bold text-blue-600">85%</div>
              <p className="text-sm text-gray-500">Profile Completeness</p>
            </div>
          </div>
        </div>

        {/* Top Skills Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <Code className="mr-2 h-5 w-5 text-blue-600" />
            Top Skills
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={mockSkills.slice(0, 5)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="level" fill="#0088FE" barSize={15} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <Code className="mr-2 h-5 w-5 text-blue-600" />
          Skills
        </h3>

        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedSkillCategory(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedSkillCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredSkills.map((skill) => (
            <div key={skill.name} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-gray-800">{skill.name}</span>
                <span className="text-sm text-blue-600">{skill.level}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${skill.level}%` }}></div>
              </div>
              <div className="mt-1 text-xs text-gray-500">{skill.category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
          Experience
        </h3>

        <div className="relative">
          {mockExperience.map((exp, index) => (
            <div key={exp.id} className="mb-8 relative pl-8">
              {/* Timeline line */}
              {index < mockExperience.length - 1 && (
                <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200"></div>
              )}

              {/* Timeline dot */}
              <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center">
                <Briefcase className="h-3 w-3 text-blue-600" />
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-800">{exp.role}</h4>
                <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mb-2">
                  <span className="font-medium">{exp.company}</span>
                  <span className="hidden sm:block sm:mx-2">•</span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {exp.period}
                  </span>
                </div>
                <p className="text-gray-700">{exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <GraduationCap className="mr-2 h-5 w-5 text-blue-600" />
          Education
        </h3>

        <div className="space-y-6">
          {mockEducation.map((edu, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center">
              <div className="sm:w-24 text-sm font-medium text-gray-500">{edu.year}</div>
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-800">{edu.degree}</h4>
                <p className="text-gray-600">{edu.institution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <Code className="mr-2 h-5 w-5 text-blue-600" />
          Projects
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map((project, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="text-lg font-medium text-gray-800 mb-2">{project.title}</h4>
              <p className="text-gray-600 mb-3 text-sm">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, techIndex) => (
                  <span key={techIndex} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
