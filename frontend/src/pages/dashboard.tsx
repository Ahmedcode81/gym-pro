import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserCheck, CreditCard, LogIn, DollarSign, TrendingUp, ArrowUp, ArrowDown, Loader2, MoreVertical, ChevronRight, Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Link } from 'react-router-dom'
import { getDashboardStats } from '@/lib/service'

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Failed to load dashboard data. Make sure the backend is running.</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Members',
      value: stats.total_members,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: '#2563EB',
      bgColor: 'bg-blue-50',
      progress: 78,
    },
    {
      title: 'Active Members',
      value: stats.active_members,
      change: '+8%',
      trend: 'up',
      icon: UserCheck,
      color: '#22C55E',
      bgColor: 'bg-green-50',
      progress: 82,
    },
    {
      title: 'Expired Memberships',
      value: stats.expired_memberships,
      change: '-3%',
      trend: 'down',
      icon: CreditCard,
      color: '#EF4444',
      bgColor: 'bg-red-50',
      progress: 15,
    },
    {
      title: "Today's Check-ins",
      value: stats.today_checkins,
      change: '+23%',
      trend: 'up',
      icon: LogIn,
      color: '#06B6D4',
      bgColor: 'bg-cyan-50',
      progress: 65,
    },
    {
      title: 'Revenue Today',
      value: `$${stats.revenue_today.toLocaleString()}`,
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: '#F59E0B',
      bgColor: 'bg-yellow-50',
      progress: 45,
    },
    {
      title: 'Revenue This Month',
      value: `$${stats.revenue_this_month.toLocaleString()}`,
      change: '+18%',
      trend: 'up',
      icon: TrendingUp,
      color: '#8B5CF6',
      bgColor: 'bg-purple-50',
      progress: 72,
    },
  ]

  const revenueData = stats.sales_chart?.labels?.map((label: string, i: number) => ({
    month: label,
    revenue: stats.sales_chart.datasets?.[0]?.data?.[i] || 0,
  })) || []

  const attendanceData = stats.attendance_chart?.labels?.map((label: string, i: number) => ({
    day: label,
    checkins: stats.attendance_chart.datasets?.[0]?.data?.[i] || 0,
  })) || []

  const quickActions = [
    { title: 'Add Member', icon: Users, color: 'bg-blue-500', href: '/members' },
    { title: 'New Membership', icon: CreditCard, color: 'bg-green-500', href: '/membership-plans' },
    { title: 'New Payment', icon: DollarSign, color: 'bg-yellow-500', href: '/payments' },
    { title: 'Check-in', icon: LogIn, color: 'bg-purple-500', href: '/check-in' },
  ]

  const recentActivities = (stats.recent_activities || []).map((activity: any) => ({
    id: activity.id,
    user: activity.user,
    action: activity.action,
    time: new Date(activity.timestamp).toLocaleString(),
    avatar: activity.user?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'S',
  }))

const activeMembers = stats.active_members
  const totalMembers = stats.total_members

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/members">
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6">
              <Plus className="h-5 w-5 mr-2" />
              Quick Add
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown
          const trendColor = stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
          return (
            <Card key={stat.title} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />
                    {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.title}</div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{stat.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${stat.progress}%`, backgroundColor: stat.color }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {quickActions.map((action, index) => (
              <Link key={action.title} to={action.href} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shadow-md`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{action.title}</div>
                    <div className="text-sm text-gray-500">Quick access</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="stat-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
              <Button variant="outline" size="sm">Last 7 Days</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F1F5F9'
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Membership Growth */}
        <Card className="stat-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Attendance</CardTitle>
              <Button variant="outline" size="sm">Last 7 Days</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F1F5F9'
                  }}
                />
                <Bar dataKey="checkins" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="stat-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity: any, index: number) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl table-row-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {activity.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No recent activities</div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-[#2563EB]">
              {totalMembers ? Math.round((activeMembers / totalMembers) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Active Rate</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-[#22C55E]">{stats.membership_statistics?.active || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Active Memberships</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-[#F59E0B]">{stats.membership_statistics?.expired || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Expired</div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-[#06B6D4]">{stats.membership_statistics?.pending || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Pending</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
