"use client"

import * as React from "react"
import {
  Home,
  FileText,
  Settings,
  BarChart3,
  Building,
} from "lucide-react"
import { useSession } from "next-auth/react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// SIKAP navigation data
const getSikapData = (session: { user?: { name?: string; email?: string } } | null) => ({
  user: {
    name: session?.user?.name || "Admin",
    email: session?.user?.email || "admin@sikap.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "SIKAP Admin",
      logo: Building,
      plan: "Kabupaten Tana Tidung",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Management",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Permohonan",
          url: "/dashboard/permohonan",
        },
        {
          title: "Users",
          url: "/dashboard/users",
        },
        {
          title: "Documents",
          url: "/dashboard/documents",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Statistics",
          url: "/dashboard/stats",
        },
        {
          title: "Reports",
          url: "/dashboard/reports",
        },
      ],
    },
    {
      title: "System",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Settings",
          url: "/dashboard/settings",
        },
        {
          title: "Configuration",
          url: "/dashboard/config",
        },
        {
          title: "Logs",
          url: "/dashboard/logs",
        },
      ],
    },
  ],
})

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const data = getSikapData(session)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
