import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, MoreVertical, Loader2, Trash2, Calendar, Users } from 'lucide-react'
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
import { getGroupClasses, createGroupClass, deleteGroupClass, getTrainers } from '@/lib/service'
import { useAuth } from '@/contexts/auth-context'

const classTypeColors: Record<string, string> = {
  yoga: 'bg-purple-100 text-purple-700',
  crossfit: 'bg-red-100 text-red-700',
  zumba: 'bg-orange-100 text-orange-700',
  cardio: 'bg-blue-100 text-blue-700',
  other: 'bg-gray-100 text-gray-700',
}

export default function GroupClasses() {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'yoga',
    trainer_id: '',
    schedule: '',
    capacity: '',
    description: '',
  })

  const branchId = user?.branch_id ? Number(user.branch_id) : 1

  const { data: classes, isLoading } = useQuery({
    queryKey: ['group-classes'],
    queryFn: () => getGroupClasses(),
  })

  const { data: trainers } = useQuery({
    queryKey: ['trainers-stub'],
    queryFn: getTrainers,
  })

  const createMutation = useMutation({
    mutationFn: createGroupClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-classes'] })
      toast({ title: 'Class created', description: 'Group class added successfully.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to create class', variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGroupClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-classes'] })
      toast({ title: 'Class deleted', description: 'Group class removed.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to delete class', variant: 'destructive' })
    },
  })

  const resetForm = () => {
    setForm({ name: '', type: 'yoga', trainer_id: '', schedule: '', capacity: '', description: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      name: form.name,
      type: form.type,
      trainer_id: parseInt(form.trainer_id),
      branch_id: branchId,
      schedule: form.schedule,
      capacity: parseInt(form.capacity),
      description: form.description || undefined,
    })
  }

  const trainerList = trainers || []
  const list = classes || []

  const trainerName = (id: number) => trainerList.find((t: any) => Number(t.id) === id)?.name || `Trainer #${id}`

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Classes</h1>
          <p className="text-gray-500 mt-1">Schedule and manage group classes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Group Class</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Class Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning Yoga" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yoga">Yoga</SelectItem>
                      <SelectItem value="crossfit">CrossFit</SelectItem>
                      <SelectItem value="zumba">Zumba</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Trainer *</Label>
                  <Select value={form.trainer_id} onValueChange={(v) => setForm({ ...form, trainer_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select trainer" /></SelectTrigger>
                    <SelectContent>
                      {trainerList.map((t: any) => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Schedule *</Label>
                  <Input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="e.g. Mon, Wed 8:00 AM" required />
                </div>
                <div>
                  <Label>Capacity *</Label>
                  <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="20" required />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Class description" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Create
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
                <div className="text-sm text-gray-500 mt-1">Total Classes</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{list.length ? list.reduce((s: number, c: any) => s + c.capacity, 0) : 0}</div>
                <div className="text-sm text-gray-500 mt-1">Total Capacity</div>
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
                <div className="text-3xl font-bold text-gray-900">{new Set(list.map((c: any) => c.type)).size}</div>
                <div className="text-sm text-gray-500 mt-1">Class Types</div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          list.map((cls: any, index: number) => (
            <Card key={cls.id} className="stat-card animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${classTypeColors[cls.type] || classTypeColors.other}`}>
                    {cls.type}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4 text-gray-500" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(String(cls.id))}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                <div className="mt-2 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {cls.schedule}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    Capacity: {cls.capacity}
                  </div>
                  <div className="text-gray-500">Trainer: {trainerName(cls.trainer_id)}</div>
                </div>
                {cls.description && (
                  <p className="mt-3 text-sm text-gray-500 line-clamp-2">{cls.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
        {!isLoading && list.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No group classes yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
