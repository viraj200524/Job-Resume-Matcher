"use client"

import { useState } from "react"
import { Menu } from "lucide-react"

export default function Header({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { id: "upload", label: "Upload Resume" },
    { id: "analysis", label: "Resume Analysis" },
    { id: "matches", label: "Candidate Matches" },
    { id: "jobs", label: "All Jobs" },
    { id: "email", label: "Email Settings" },
  ]

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Resume Analyzer</h1>
              <p className="text-sm text-gray-600">Match candidates to the perfect job</p>
            </div>
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>

          <nav className={`mt-4 md:mt-0 ${mobileMenuOpen ? "block" : "hidden md:block"}`}>
            <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
