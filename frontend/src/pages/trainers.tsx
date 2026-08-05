import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Phone, Mail, MoreVertical, Loader2, Pencil, Trash2, Dumbbell } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { useToast } from '@/hooks/use-toast'
import { getTrainers, createTrainer, updateTrainer, deleteTrainer } from '@/lib/service'
import { useAuth } from '@/contexts/auth-context'

export default function Trainers() {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    salary: '',
    specialization: '',
  })

  const branchId = user?.branch_id ? Number(user.branch_id) : 1

  const { data: trainers, isLoading, isError } = useQuery({
    queryKey: ['trainers'],
    queryFn: getTrainers,
  })

  const createMutation = useMutation({
    mutationFn: createTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] })
      toast({ title: 'Trainer added', description: 'Trainer created successfully.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.detail || 'Failed to create trainer',
        variant: 'destructive',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateTrainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] })
      toast({ title: 'Trainer updated', description: 'Trainer updated successfully.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.detail || 'Failed to update trainer',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] })
      toast({ title: 'Trainer deleted', description: 'Trainer removed successfully.' })
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.response?.data?.detail || 'Failed to delete trainer',
        variant: 'destructive',
      })
    },
  })

  const resetForm = () => {
    setEditingTrainer(null)
    setForm({ name: '', phone: '', email: '', salary: '', specialization: '' })
  }

  const handleEdit = (trainer: any) => {
    setEditingTrainer(trainer)
    setForm({
      name: trainer.name,
      phone: trainer.phone,
      email: trainer.email || '',
      salary: String(trainer.salary),
      specialization: trainer.specialization,
    })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      salary: parseFloat(form.salary),
      specialization: form.specialization,
      branch_id: branchId,
    }

    if (editingTrainer) {
      updateMutation.mutate({ id: Number(editingTrainer.id), data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const list = trainers || []
  const specializations = [...new Set(list.filter((t: any) => t.specialization).map((t: any) => t.specialization))]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trainers</h1>
          <p className="text-gray-500 mt-1">Manage your gym trainers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Trainer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Trainer name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone *</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1234567890" required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="trainer@example.com" />
                </div>
                <div>
                  <Label>Salary ($) *</Label>
                  <Input type="number" step="0.01" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="2500" required />
                </div>
                <div>
                  <Label>Specialization *</Label>
                  <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Strength Training" required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editingTrainer ? 'Update Trainer' : 'Add Trainer'}
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
                <div className="text-3xl font-bold text-gray-900">{list.length}</div>
                <div className="text-sm text-gray-500 mt-1">Total Trainers</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{specializations.length}</div>
                <div className="text-sm text-gray-500 mt-1">Specializations</div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  ${list.length ? Math.round(list.reduce((s: number, t: any) => s + t.salary, 0)) : 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">Monthly Payroll</div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trainers Table */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Trainers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-gray-500">
              <p>Failed to load trainers. Make sure the backend is running.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Trainer</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Specialization</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Salary</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((trainer: any, index: number) => (
                    <tr key={trainer.id} className="border-b border-gray-100 table-row-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[#2563EB] text-white">
                              {trainer.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-semibold text-gray-900">{trainer.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {trainer.phone}
                          </div>
                          {trainer.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4 text-gray-400" />
                              {trainer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {trainer.specialization}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900">${trainer.salary.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                              <MoreVertical className="h-5 w-5 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(trainer)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(String(trainer.id))}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">No trainers found</td>
                    </tr>
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
