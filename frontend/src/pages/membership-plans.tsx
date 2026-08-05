import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Plus, Edit, Trash2, Check, DollarSign, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { getMembershipPlans, createMembershipPlan, updateMembershipPlan, deleteMembershipPlan } from '@/lib/service'
import { useAuth } from '@/contexts/auth-context'

export default function MembershipPlans() {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    price: '',
    duration_days: '',
    freeze_days: '0',
    max_visits: '',
    description: '',
  })

  const branchId = user?.branch_id ? Number(user.branch_id) : 1

  const { data: plans, isLoading, isError } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: getMembershipPlans,
  })

  const createMutation = useMutation({
    mutationFn: createMembershipPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] })
      toast({ title: 'Plan created', description: 'Membership plan created successfully.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.detail || 'Failed to create plan',
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateMembershipPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] })
      toast({ title: 'Plan updated', description: 'Membership plan updated successfully.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.detail || 'Failed to update plan',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMembershipPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] })
      toast({ title: 'Plan deleted', description: 'Membership plan deleted successfully.' })
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.detail || 'Failed to delete plan',
        variant: 'destructive',
      })
    },
  })

  const resetForm = () => {
    setEditingPlan(null)
    setForm({ name: '', price: '', duration_days: '', freeze_days: '0', max_visits: '', description: '' })
  }

  const handleEdit = (plan: any) => {
    setEditingPlan(plan)
    setForm({
      name: plan.name,
      price: String(plan.price),
      duration_days: String(plan.duration_days),
      freeze_days: String(plan.freeze_days || 0),
      max_visits: plan.max_visits ? String(plan.max_visits) : '',
      description: plan.description || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      duration_days: parseInt(form.duration_days),
      freeze_days: parseInt(form.freeze_days || '0'),
      max_visits: form.max_visits ? parseInt(form.max_visits) : undefined,
      description: form.description || undefined,
      branch_id: branchId,
    }

    if (editingPlan) {
      updateMutation.mutate({ id: Number(editingPlan.id), data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const planList = plans || []

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Membership Plans</h1>
          <p className="text-gray-500 mt-1">Manage membership plans</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Plan Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Monthly Premium"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price ($) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="99.00"
                    required
                  />
                </div>
                <div>
                  <Label>Duration (days) *</Label>
                  <Input
                    type="number"
                    value={form.duration_days}
                    onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                    placeholder="30"
                    required
                  />
                </div>
                <div>
                  <Label>Freeze Days</Label>
                  <Input
                    type="number"
                    value={form.freeze_days}
                    onChange={(e) => setForm({ ...form, freeze_days: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Max Visits</Label>
                  <Input
                    type="number"
                    value={form.max_visits}
                    onChange={(e) => setForm({ ...form, max_visits: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Plan description"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {editingPlan ? 'Update Plan' : 'Add Plan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-gray-500">
          <p>Failed to load plans. Make sure the backend is running.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {planList.map((plan: any, index: number) => (
            <Card key={plan.id} className="stat-card relative border-2 border-gray-200 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">${plan.price.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{plan.duration_days} days</div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {plan.freeze_days} freeze days
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {plan.max_visits ? `${plan.max_visits} max visits` : 'Unlimited visits'}
                  </li>
                  {plan.description && (
                    <li className="text-sm text-gray-500">{plan.description}</li>
                  )}
                </ul>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50" onClick={() => handleEdit(plan)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={() => deleteMutation.mutate(String(plan.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {planList.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No membership plans found</p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{planList.length}</div>
                <div className="text-sm text-gray-500 mt-1">Active Plans</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  ${planList.length ? Math.round(planList.reduce((s: number, p: any) => s + p.price, 0) / planList.length) : 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">Avg. Price</div>
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
                <div className="text-3xl font-bold text-gray-900">
                  {planList.filter((p: any) => p.freeze_days > 0).length}
                </div>
                <div className="text-sm text-gray-500 mt-1">With Freeze Days</div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Check className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
