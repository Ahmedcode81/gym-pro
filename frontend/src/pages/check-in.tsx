import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { LogIn, QrCode, Barcode, Clock, Users, TrendingUp, Loader2, LogOut } from 'lucide-react'
import { getMembers, getCheckins, createCheckin, checkout } from '@/lib/service'
import { useAuth } from '@/contexts/auth-context'

export default function CheckIn() {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [memberInput, setMemberInput] = useState('')

  const branchId = user?.branch_id ? Number(user.branch_id) : 1

  const { data: membersData } = useQuery({
    queryKey: ['members-stub'],
    queryFn: () => getMembers({ page: 1, page_size: 100 }),
  })

  const { data: checkins, isLoading } = useQuery({
    queryKey: ['checkins'],
    queryFn: () => getCheckins({ branch_id: branchId }),
  })

  const checkinMutation = useMutation({
    mutationFn: createCheckin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast({ title: 'Checked in', description: 'Member checked in successfully.' })
      setMemberInput('')
    },
    onError: (err: any) => {
      toast({ title: 'Check-in failed', description: err?.response?.data?.detail || 'Failed to check in member', variant: 'destructive' })
    },
  })

  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] })
      toast({ title: 'Checked out', description: 'Member checked out successfully.' })
    },
    onError: (err: any) => {
      toast({ title: 'Checkout failed', description: err?.response?.data?.detail || 'Failed to check out member', variant: 'destructive' })
    },
  })

  const members = membersData?.items || []

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault()
    const member = members.find((m: any) =>
      m.phone.includes(memberInput) || String(m.id) === memberInput
    )
    if (!member) {
      toast({ title: 'Member not found', description: 'No member matches that ID or phone.', variant: 'destructive' })
      return
    }
    checkinMutation.mutate({
      member_id: Number(member.id),
      branch_id: branchId,
      method: 'manual',
    })
  }

  const list = checkins || []
  const todayCheckins = list.filter((c: any) => new Date(c.entry_time).toDateString() === new Date().toDateString())
  const activeCheckins = list.filter((c: any) => !c.exit_time)

  const memberName = (id: number) => members.find((m: any) => Number(m.id) === id)?.full_name || `Member #${id}`

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Check In</h1>
        <p className="text-gray-500 mt-1">Member check-in system</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{todayCheckins.length}</div>
                <div className="text-sm text-gray-500 mt-1">Today's Check-ins</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <LogIn className="h-6 w-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{activeCheckins.length}</div>
                <div className="text-sm text-gray-500 mt-1">Currently In Gym</div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{members.length}</div>
                <div className="text-sm text-gray-500 mt-1">Members</div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Check-in */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <LogIn className="h-5 w-5 text-[#2563EB]" />
              Quick Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleCheckin} className="relative">
              <Input
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                placeholder="Enter member ID or phone number"
                className="h-14 text-lg border-gray-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20 pr-36"
              />
              <Button type="submit" disabled={checkinMutation.isPending} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-10 px-6">
                {checkinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check In'}
              </Button>
            </form>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Current time: {new Date().toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        {/* Scan Check-in */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5 text-purple-600" />
              Scan Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-24 flex-col gap-2 border-2 border-gray-200 hover:border-[#2563EB] hover:bg-blue-50 transition-colors">
                <QrCode className="h-8 w-8" />
                <span className="font-medium">QR Code</span>
              </Button>
              <Button className="h-24 flex-col gap-2 border-2 border-gray-200 hover:border-[#2563EB] hover:bg-blue-50 transition-colors">
                <Barcode className="h-8 w-8" />
                <span className="font-medium">Barcode</span>
              </Button>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">
                Use the member ID or phone number for manual check-in. QR/barcode scanning is ready on compatible hardware.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Check-ins */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Recent Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : list.length > 0 ? (
            <div className="space-y-3">
              {list.slice(0, 10).map((checkin: any, index: number) => (
                <div key={checkin.id} className="flex items-center gap-4 p-4 rounded-xl table-row-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center text-white font-semibold">
                    {memberName(checkin.member_id).split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{memberName(checkin.member_id)}</h4>
                    <p className="text-sm text-gray-500">{new Date(checkin.entry_time).toLocaleString()}</p>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize">
                    {checkin.method}
                  </div>
                  {checkin.exit_time ? (
                    <span className="px-3 py-1 bg-green-100 rounded-full text-xs font-medium text-green-700">Checked out</span>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => checkoutMutation.mutate(String(checkin.id))} className="border-gray-200 hover:bg-gray-50">
                      <LogOut className="h-4 w-4 mr-2" />
                      Checkout
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <LogIn className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No check-ins recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
