import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BarChart3, DollarSign, Users, Loader2, Package, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getRevenueReport, getMembershipReport, getInventoryReport, getTrainersReport } from '@/lib/service'

export default function Reports() {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['report-revenue', startDate, endDate],
    queryFn: () => getRevenueReport({ start_date: startDate, end_date: endDate }),
  })

  const { data: membership } = useQuery({
    queryKey: ['report-membership'],
    queryFn: () => getMembershipReport(),
  })

  const { data: inventory } = useQuery({
    queryKey: ['report-inventory'],
    queryFn: () => getInventoryReport(),
  })

  const { data: trainers } = useQuery({
    queryKey: ['report-trainers'],
    queryFn: () => getTrainersReport(),
  })

  const revenueByMethod = revenue?.revenue_by_method || {}
  const revenueChartData = Object.entries(revenueByMethod).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }))

  const statusData = membership?.status_breakdown
    ? Object.entries(membership.status_breakdown).map(([name, value]) => ({ name, value }))
    : []

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Business analytics and reports</p>
      </div>

      {/* Date Range */}
      <Card className="stat-card">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Start Date</div>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-48" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">End Date</div>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-48" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#2563EB]" />
              Revenue by Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#F1F5F9' }} />
                  <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Membership Breakdown */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Membership Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#F1F5F9' }} />
                <Bar dataKey="value" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  ${revenue?.total_revenue?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total Revenue</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{revenue?.transaction_count || 0}</div>
                <div className="text-sm text-gray-500 mt-1">Transactions</div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{inventory?.total_products || 0}</div>
                <div className="text-sm text-gray-500 mt-1">Products</div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{inventory?.low_stock_items || 0}</div>
                <div className="text-sm text-gray-500 mt-1">Low Stock Items</div>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trainer Stats + Inventory Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-[#2563EB]" />
              Trainer Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trainer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Specialization</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Programs</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {(trainers?.trainer_statistics || []).map((t: any) => (
                    <tr key={t.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{t.name}</td>
                      <td className="py-3 px-4 text-gray-600">{t.specialization}</td>
                      <td className="py-3 px-4 text-gray-600">{t.active_programs}</td>
                      <td className="py-3 px-4 text-gray-600">${t.salary.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-red-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(inventory?.low_stock_details || []).length > 0 ? (
              <div className="space-y-3">
                {inventory.low_stock_details.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-sm text-red-600 font-semibold">{item.quantity} left</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No low stock items</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
