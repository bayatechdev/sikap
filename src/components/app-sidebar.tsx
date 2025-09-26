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
import { NavLink } from "@/components/nav-link"
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
    },
  ],
  navGroups: [
    {
      label: "Applications",
      items: [
        {
          title: "Permohonan",
          url: "/dashboard/permohonan",
          icon: FileText,
        },
      ],
    },
    {
      label: "Data Management",
      items: [
        {
          title: "Kerjasama",
          url: "/dashboard/kerjasama",
          icon: FileText,
        },
        {
          title: "Jenis Kerjasama",
          url: "/dashboard/jenis-kerjasama",
          icon: FileText,
        },
        {
          title: "Dasar Hukum",
          url: "/dashboard/dasar-hukum",
          icon: FileText,
        },
        {
          title: "SOP",
          url: "/dashboard/sop",
          icon: FileText,
        },
        {
          title: "Users",
          url: "#",
          icon: Settings,
          items: [
            {
              title: "User Management",
              url: "/dashboard/users",
            },
            {
              title: "Roles & Permissions",
              url: "/dashboard/roles",
            },
          ],
        },
        {
          title: "Documents",
          url: "#",
          icon: FileText,
          items: [
            {
              title: "Document Library",
              url: "/dashboard/documents",
            },
            {
              title: "Templates",
              url: "/dashboard/templates",
            },
          ],
        },
      ],
    },
    {
      label: "Reports & Analytics",
      items: [
        {
          title: "Statistics",
          url: "/dashboard/stats",
          icon: BarChart3,
        },
        {
          title: "Reports",
          url: "#",
          icon: FileText,
          items: [
            {
              title: "Monthly Reports",
              url: "/dashboard/reports/monthly",
            },
            {
              title: "Annual Reports",
              url: "/dashboard/reports/annual",
            },
          ],
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          title: "Settings",
          url: "#",
          icon: Settings,
          items: [
            {
              title: "General Settings",
              url: "/dashboard/settings",
            },
            {
              title: "Configuration",
              url: "/dashboard/config",
            },
            {
              title: "System Logs",
              url: "/dashboard/logs",
            },
          ],
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
        <NavLink items={data.navMain} />
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
