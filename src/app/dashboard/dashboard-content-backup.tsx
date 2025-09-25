'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

interface DashboardStats {
  totalApplications: number;
  applicationsToday: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalUsers: number;
  totalDocuments: number;
  trends: {
    applications: number;
    approved: number;
  };
}

interface RecentApplication {
  id: string;
  trackingNumber: string;
  title: string;
  status: string;
  submittedAt: string;
  contactPerson: string;
  institutionName: string;
  cooperationType: {
    name: string;
  };
}

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setStats(data.stats);
      setRecentApplications(data.recentApplications);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'default';
      case 'SUBMITTED': return 'secondary';
      case 'REJECTED': return 'destructive';
      case 'IN_REVIEW': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Disetujui';
      case 'SUBMITTED': return 'Baru';
      case 'REJECTED': return 'Ditolak';
      case 'IN_REVIEW': return 'Review';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-red-600">Error: {error}</p>
        </div>
        <Button onClick={fetchDashboardData} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Total Permohonan",
      value: stats?.totalApplications.toString() || "0",
      description: "Total applications",
      icon: FileText,
      trend: `${stats?.trends.applications || 0}%`,
    },
    {
      title: "Permohonan Hari Ini",
      value: stats?.applicationsToday.toString() || "0",
      description: "New submissions today",
      icon: Clock,
      trend: "+0%",
    },
    {
      title: "Permohonan Disetujui",
      value: stats?.approvedApplications.toString() || "0",
      description: "Approved applications",
      icon: CheckCircle,
      trend: `${stats?.trends.approved || 0}%`,
    },
    {
      title: "Pending Review",
      value: stats?.pendingApplications.toString() || "0",
      description: "Awaiting approval",
      icon: XCircle,
      trend: "0%",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to SIKAP Admin Dashboard
        </p>
      </div> */}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/permohonan">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Manage Applications
              </Button>
            </Link>
            <Link href="/dashboard/users">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Latest submissions to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.length > 0 ? recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between space-x-4">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {application.trackingNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {application.title} - {application.cooperationType.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {application.contactPerson} ({application.institutionName})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(application.status)}>
                      {getStatusLabel(application.status)}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(application.submittedAt)}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent applications
                </p>
              )}
            </div>
            {recentApplications.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Link href="/dashboard/permohonan">
                  <Button variant="outline" className="w-full">
                    View All Applications
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}