import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Ruler, Trash2, MoreVertical } from 'lucide-react'
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
import { getBodyMeasurements, createBodyMeasurement, deleteBodyMeasurement, getMembers } from '@/lib/service'

export default function BodyMeasurements() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState('')
  const [form, setForm] = useState({
    weight: '',
    height: '',
    body_fat: '',
    muscle_mass: '',
    waist: '',
    chest: '',
    arms: '',
    legs: '',
  })

  const { data: members } = useQuery({
    queryKey: ['members-stub'],
    queryFn: () => getMembers({ page: 1, page_size: 100 }),
  })

  const { data: measurements, isLoading } = useQuery({
    queryKey: ['measurements', selectedMember],
    queryFn: () => getBodyMeasurements(selectedMember || undefined),
  })

  const createMutation = useMutation({
    mutationFn: createBodyMeasurement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] })
      toast({ title: 'Measurement added', description: 'Body measurement recorded.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to add measurement', variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBodyMeasurement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] })
      toast({ title: 'Measurement deleted', description: 'Measurement removed.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to delete measurement', variant: 'destructive' })
    },
  })

  const resetForm = () => {
    setForm({
      weight: '', height: '', body_fat: '', muscle_mass: '',
      waist: '', chest: '', arms: '', legs: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const weight = parseFloat(form.weight)
    const height = parseFloat(form.height)
    const bmi = weight / ((height / 100) * (height / 100))

    createMutation.mutate({
      member_id: parseInt(selectedMember),
      date: new Date().toISOString().split('T')[0],
      weight,
      height,
      bmi: Math.round(bmi * 100) / 100,
      body_fat: form.body_fat ? parseFloat(form.body_fat) : undefined,
      muscle_mass: form.muscle_mass ? parseFloat(form.muscle_mass) : undefined,
      waist: form.waist ? parseFloat(form.waist) : undefined,
      chest: form.chest ? parseFloat(form.chest) : undefined,
      arms: form.arms ? parseFloat(form.arms) : undefined,
      legs: form.legs ? parseFloat(form.legs) : undefined,
    })
  }

  const memberList = (members as any)?.items || []
  const list = measurements || []

  const memberName = (id: number) => memberList.find((m: any) => Number(m.id) === id)?.full_name || `Member #${id}`

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Body Measurements</h1>
          <p className="text-gray-500 mt-1">Track member body metrics</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Measurement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Body Measurement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Member *</Label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent>
                    {memberList.map((m: any) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Weight (kg) *</Label>
                  <Input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} required />
                </div>
                <div>
                  <Label>Height (cm) *</Label>
                  <Input type="number" step="0.1" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} required />
                </div>
                <div>
                  <Label>Body Fat (%)</Label>
                  <Input type="number" step="0.1" value={form.body_fat} onChange={(e) => setForm({ ...form, body_fat: e.target.value })} />
                </div>
                <div>
                  <Label>Muscle Mass (kg)</Label>
                  <Input type="number" step="0.1" value={form.muscle_mass} onChange={(e) => setForm({ ...form, muscle_mass: e.target.value })} />
                </div>
                <div>
                  <Label>Waist (cm)</Label>
                  <Input type="number" step="0.1" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} />
                </div>
                <div>
                  <Label>Chest (cm)</Label>
                  <Input type="number" step="0.1" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} />
                </div>
                <div>
                  <Label>Arms (cm)</Label>
                  <Input type="number" step="0.1" value={form.arms} onChange={(e) => setForm({ ...form, arms: e.target.value })} />
                </div>
                <div>
                  <Label>Legs (cm)</Label>
                  <Input type="number" step="0.1" value={form.legs} onChange={(e) => setForm({ ...form, legs: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Card className="stat-card">
        <CardContent className="p-6">
          <div className="max-w-sm">
            <Label>Filter by Member</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger><SelectValue placeholder="All members" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Members</SelectItem>
                {memberList.map((m: any) => (
                  <SelectItem key={m.id} value={String(m.id)}>{m.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Measurements */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Ruler className="h-5 w-5 text-[#2563EB]" />
            Measurement Records
          </CardTitle>
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
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Weight</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Height</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">BMI</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Body Fat</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((m: any, index: number) => (
                    <tr key={m.id} className="border-b border-gray-100 table-row-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="py-4 px-4 font-medium text-gray-900">{memberName(m.member_id)}</td>
                      <td className="py-4 px-4 text-gray-600">{m.date}</td>
                      <td className="py-4 px-4 text-gray-600">{m.weight} kg</td>
                      <td className="py-4 px-4 text-gray-600">{m.height} cm</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          m.bmi < 18.5 ? 'bg-yellow-100 text-yellow-700' : m.bmi < 25 ? 'bg-green-100 text-green-700' : m.bmi < 30 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {m.bmi}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{m.body_fat ? `${m.body_fat}%` : '—'}</td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100"><MoreVertical className="h-5 w-5 text-gray-500" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(String(m.id))}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-500">No measurements recorded</td></tr>
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
