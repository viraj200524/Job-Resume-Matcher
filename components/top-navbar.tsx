"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Briefcase, FileText, Home, LogOut, Menu, Settings, User, Users, Video, Sparkles } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function TopNavbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const candidateLinks = [
    { href: "/candidate/dashboard", label: "Dashboard", icon: Home },
    { href: "/candidate/profile", label: "Profile", icon: User },
    { href: "/candidate/matches", label: "Job Matches", icon: Briefcase },
    { href: "/candidate/applications", label: "Applications", icon: FileText },
    { href: "/candidate/interviews", label: "Interviews", icon: Video },
    { href: "/candidate/analytics", label: "Analytics", icon: Sparkles },
    { href: "/candidate/settings", label: "Settings", icon: Settings },
  ]

  const recruiterLinks = [
    { href: "/recruiter/dashboard", label: "Dashboard", icon: Home },
    { href: "/recruiter/jobs", label: "Jobs", icon: Briefcase },
    { href: "/recruiter/candidates", label: "Candidates", icon: Users },
    { href: "/recruiter/applications", label: "Applications", icon: FileText },
    { href: "/recruiter/interviews", label: "Interviews", icon: Video },
    { href: "/recruiter/analytics", label: "Analytics", icon: Sparkles },
    { href: "/recruiter/settings", label: "Settings", icon: Settings },
  ]

  const links = user?.role === "candidate" ? candidateLinks : recruiterLinks

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">JobMatch AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={user.role === "candidate" ? "/candidate/dashboard" : "/recruiter/dashboard"}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden md:inline-block">JobMatch AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors flex items-center gap-1 hover:text-primary ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Trigger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col gap-6 py-4">
              <div className="flex items-center gap-2 px-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">JobMatch AI</span>
              </div>
              <nav className="flex flex-col gap-2 px-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                      isActive(link.href) ? "bg-accent" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={user.role === "candidate" ? "/candidate/profile" : "/recruiter/settings"}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={user.role === "candidate" ? "/candidate/settings" : "/recruiter/settings"}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
