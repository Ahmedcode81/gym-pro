import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, MoreVertical, Loader2, Pencil, Trash2, Dumbbell, ClipboardList } from 'lucide-react'
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
import { getWorkoutPrograms, createWorkoutProgram, updateWorkoutProgram, deleteWorkoutProgram, getMembers, getTrainers } from '@/lib/service'

export default function WorkoutPrograms() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<any>(null)
  const [form, setForm] = useState({
    trainer_id: '',
    member_id: '',
    name: '',
    description: '',
  })

  const { data: programs, isLoading } = useQuery({
    queryKey: ['workout-programs'],
    queryFn: () => getWorkoutPrograms(),
  })

  const { data: members } = useQuery({
    queryKey: ['members-stub'],
    queryFn: () => getMembers({ page: 1, page_size: 100 }),
  })

  const { data: trainers } = useQuery({
    queryKey: ['trainers-stub'],
    queryFn: getTrainers,
  })

  const createMutation = useMutation({
    mutationFn: createWorkoutProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-programs'] })
      toast({ title: 'Program created', description: 'Workout program added successfully.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to create program', variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteWorkoutProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-programs'] })
      toast({ title: 'Program deleted', description: 'Workout program removed.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to delete program', variant: 'destructive' })
    },
  })

  const resetForm = () => {
    setEditingProgram(null)
    setForm({ trainer_id: '', member_id: '', name: '', description: '' })
  }

  const handleEdit = (program: any) => {
    setEditingProgram(program)
    setForm({
      trainer_id: String(program.trainer_id),
      member_id: String(program.member_id),
      name: program.name,
      description: program.description || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      trainer_id: parseInt(form.trainer_id),
      member_id: parseInt(form.member_id),
      name: form.name,
      description: form.description || undefined,
      exercises: [],
    }

    if (editingProgram) {
      updateWorkoutProgram(String(editingProgram.id), payload)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['workout-programs'] })
          toast({ title: 'Program updated', description: 'Workout program updated.' })
          setDialogOpen(false)
          resetForm()
        })
        .catch((err) => toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to update', variant: 'destructive' }))
    } else {
      createMutation.mutate(payload)
    }
  }

  const memberList = (members as any)?.items || []
  const trainerList = trainers || []
  const list = programs || []

  const memberName = (id: number) => memberList.find((m: any) => Number(m.id) === id)?.full_name || `Member #${id}`
  const trainerName = (id: number) => trainerList.find((t: any) => Number(t.id) === id)?.name || `Trainer #${id}`

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workout Programs</h1>
          <p className="text-gray-500 mt-1">Create and manage workout plans</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProgram ? 'Edit Program' : 'Create Workout Program'}</DialogTitle>
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
                <Label>Program Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Strength Training Plan" required />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Program description" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editingProgram ? 'Update' : 'Create'}
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
                <div className="text-sm text-gray-500 mt-1">Total Programs</div>
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
                <div className="text-3xl font-bold text-gray-900">{new Set(list.map((p: any) => p.member_id)).size}</div>
                <div className="text-sm text-gray-500 mt-1">Members on Plans</div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{new Set(list.map((p: any) => p.trainer_id)).size}</div>
                <div className="text-sm text-gray-500 mt-1">Trainers</div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs List */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Programs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list.map((program: any, index: number) => (
                <div key={program.id} className="p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center">
                      <Dumbbell className="h-5 w-5 text-white" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4 text-gray-500" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(program)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(String(program.id))}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-semibold text-gray-900">{program.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{program.description || 'No description'}</p>
                  <div className="mt-4 space-y-1 text-sm text-gray-600">
                    <div>Member: <span className="font-medium text-gray-900">{memberName(program.member_id)}</span></div>
                    <div>Trainer: <span className="font-medium text-gray-900">{trainerName(program.trainer_id)}</span></div>
                    <div>Exercises: <span className="font-medium text-gray-900">{program.exercises?.length || 0}</span></div>
                  </div>
                </div>
              ))}
              {list.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Dumbbell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No workout programs yet</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
