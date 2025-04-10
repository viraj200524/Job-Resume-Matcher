"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BarChart3, Briefcase, FileText, Home, LogOut, Settings, User, Users, Video } from "lucide-react"

export function AppSidebar() {
  const pathname = usePathname()
  const [userType, setUserType] = useState<"candidate" | "recruiter" | null>(
    pathname.includes("/candidate") ? "candidate" : pathname.includes("/recruiter") ? "recruiter" : null,
  )

  const candidateMenuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/candidate/dashboard",
    },
    {
      title: "My Profile",
      icon: User,
      href: "/candidate/profile",
    },
    {
      title: "Job Matches",
      icon: Briefcase,
      href: "/candidate/matches",
    },
    {
      title: "My Applications",
      icon: FileText,
      href: "/candidate/applications",
    },
    {
      title: "Interviews",
      icon: Video,
      href: "/candidate/interviews",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/candidate/analytics",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/candidate/settings",
    },
  ]

  const recruiterMenuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/recruiter/dashboard",
    },
    {
      title: "Candidates",
      icon: Users,
      href: "/recruiter/candidates",
    },
    {
      title: "Job Listings",
      icon: Briefcase,
      href: "/recruiter/jobs",
    },
    {
      title: "Applications",
      icon: FileText,
      href: "/recruiter/applications",
    },
    {
      title: "Interviews",
      icon: Video,
      href: "/recruiter/interviews",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/recruiter/analytics",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/recruiter/settings",
    },
  ]

  const menuItems = userType === "candidate" ? candidateMenuItems : userType === "recruiter" ? recruiterMenuItems : []

  return (
    <>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="font-bold text-xl text-white">TalentMatch</div>
          </Link>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          {userType && (
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarContent>
        {userType && (
          <SidebarFooter className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start gap-2 text-white hover:bg-sidebar-accent"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-white/20">{userType === "candidate" ? "JD" : "RC"}</AvatarFallback>
                  </Avatar>
                  <span>{userType === "candidate" ? "John Doe" : "Recruiter Co."}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${userType}/profile`}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${userType}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        )}
      </Sidebar>
    </>
  )
}
