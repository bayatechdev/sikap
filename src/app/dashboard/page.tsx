import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, CheckCircle, Clock } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Pengguna",
      value: "1,234",
      description: "Active users",
      icon: Users,
      trend: "+12%",
    },
    {
      title: "Permohonan Hari Ini",
      value: "45",
      description: "New submissions",
      icon: FileText,
      trend: "+8%",
    },
    {
      title: "Permohonan Selesai",
      value: "892",
      description: "This month",
      icon: CheckCircle,
      trend: "+23%",
    },
    {
      title: "Pending Review",
      value: "67",
      description: "Awaiting approval",
      icon: Clock,
      trend: "-5%",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      user: "John Doe",
      action: "Submitted permohonan",
      type: "Izin Usaha",
      time: "2 minutes ago",
      status: "pending"
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "Approved permohonan",
      type: "Izin Lingkungan",
      time: "15 minutes ago",
      status: "approved"
    },
    {
      id: 3,
      user: "Bob Wilson",
      action: "Updated documents",
      type: "Izin Bangunan",
      time: "1 hour ago",
      status: "in_review"
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to SIKAP Admin Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between space-x-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.user}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action} - {activity.type}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      activity.status === 'approved' ? 'default' :
                      activity.status === 'pending' ? 'secondary' :
                      'outline'
                    }
                  >
                    {activity.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}