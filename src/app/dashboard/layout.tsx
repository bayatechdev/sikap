'use client'

import "./dashboard.css"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Users, FileText, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Users", href: "/dashboard/users" },
  { icon: FileText, label: "Permohonan", href: "/dashboard/permohonan" },
  { icon: BarChart3, label: "Statistik", href: "/dashboard/stats" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="dashboard-theme flex h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 bg-card border-r shadow-sm lg:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-center h-16 border-b px-6">
            <h1 className="text-xl font-bold text-foreground">SIKAP Admin</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Header + Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-card border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">SIKAP Admin</h1>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-card">
                <div className="flex flex-col h-full">
                  <div className="py-4">
                    <h2 className="text-lg font-bold text-foreground">SIKAP Admin</h2>
                  </div>
                  <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}