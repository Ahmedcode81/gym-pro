import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign, Plus, MoreVertical, Loader2, Receipt, RotateCcw, TrendingUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { getPayments, createPayment, refundPayment, getMembers } from '@/lib/service'
import { useAuth } from '@/contexts/auth-context'

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

export default function Payments() {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    member_id: '',
    amount: '',
    method: 'cash',
  })

  const branchId = user?.branch_id ? Number(user.branch_id) : 1

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => getPayments({ branch_id: branchId }),
  })

  const { data: members } = useQuery({
    queryKey: ['members-stub'],
    queryFn: () => getMembers({ page: 1, page_size: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast({ title: 'Payment recorded', description: 'Payment created successfully.' })
      setDialogOpen(false)
      setForm({ member_id: '', amount: '', method: 'cash' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to create payment', variant: 'destructive' })
    },
  })

  const refundMutation = useMutation({
    mutationFn: refundPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast({ title: 'Payment refunded', description: 'Payment refunded successfully.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to refund payment', variant: 'destructive' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      member_id: parseInt(form.member_id),
      amount: parseFloat(form.amount),
      method: form.method,
      branch_id: branchId,
    })
  }

  const memberList = (members as any)?.items || []
  const list = payments || []
  const totalRevenue = list.filter((p: any) => p.status === 'completed').reduce((s: number, p: any) => s + p.amount, 0)
  const totalRefunded = list.filter((p: any) => p.status === 'refunded').reduce((s: number, p: any) => s + p.amount, 0)

  const memberName = (id: number) => memberList.find((m: any) => Number(m.id) === id)?.full_name || `Member #${id}`

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Manage payments and billing</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Member *</Label>
                <Select value={form.member_id} onValueChange={(v) => setForm({ ...form, member_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent>
                    {memberList.map((m: any) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount ($) *</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="99.00" required />
              </div>
              <div>
                <Label>Payment Method *</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="apple_pay">Apple Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Record Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">Total Collected</div>
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
                <div className="text-3xl font-bold text-gray-900">{list.length}</div>
                <div className="text-sm text-gray-500 mt-1">Transactions</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Receipt className="h-6 w-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">${totalRefunded.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">Refunded</div>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Member</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Method</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((payment: any, index: number) => (
                    <tr key={payment.id} className="border-b border-gray-100 table-row-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="py-4 px-4 font-medium text-gray-900">{memberName(payment.member_id)}</td>
                      <td className="py-4 px-4 font-semibold text-gray-900">${payment.amount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-600 capitalize">{payment.method.replace(/_/g, ' ')}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[payment.status] || statusColors.pending}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{new Date(payment.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100"><MoreVertical className="h-5 w-5 text-gray-500" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className={payment.status === 'refunded' ? 'opacity-50 pointer-events-none' : 'text-red-600'}
                              onClick={() => refundMutation.mutate(String(payment.id))}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Refund
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-500">No payments recorded</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
