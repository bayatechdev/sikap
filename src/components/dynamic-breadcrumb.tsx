'use client'

import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const routeMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/permohonan': 'Permohonan',
  '/dashboard/users': 'User Management',
  '/dashboard/users/create': 'Create User',
  '/dashboard/settings': 'Settings',
  '/dashboard/stats': 'Statistics',
  '/dashboard/reports': 'Reports',
  '/dashboard/documents': 'Documents',
  '/dashboard/config': 'Configuration',
  '/dashboard/logs': 'Logs',
}

function getRouteTitle(path: string): string {
  // Check for exact match first
  if (routeMap[path]) {
    return routeMap[path]
  }

  // Handle dynamic routes like /dashboard/users/[id]
  if (path.startsWith('/dashboard/users/') && path !== '/dashboard/users/create') {
    return 'Edit User'
  }

  if (path.startsWith('/dashboard/permohonan/') && path.length > '/dashboard/permohonan/'.length) {
    return 'Application Details'
  }

  // Default fallback
  const segments = path.split('/').filter(Boolean)
  return segments[segments.length - 1]?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { path: string; title: string; isLast: boolean }[] = []

  // Build breadcrumb paths
  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`

    // Skip the first segment if it's just "dashboard" and there are more segments
    if (currentPath === '/dashboard' && segments.length > 1) {
      continue
    }

    breadcrumbs.push({
      path: currentPath,
      title: getRouteTitle(currentPath),
      isLast: i === segments.length - 1
    })
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">
            SIKAP Admin
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.map((crumb) => (
          <div key={crumb.path} className="flex items-center">
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.path}>
                  {crumb.title}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}