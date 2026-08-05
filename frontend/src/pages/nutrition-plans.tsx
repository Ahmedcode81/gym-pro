import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, MoreVertical, Loader2, Trash2, Apple, Flame } from 'lucide-react'
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
import { getNutritionPlans, createNutritionPlan, deleteNutritionPlan, getMembers, getTrainers } from '@/lib/service'

export default function NutritionPlans() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    trainer_id: '',
    member_id: '',
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  const { data: plans, isLoading } = useQuery({
    queryKey: ['nutrition-plans'],
    queryFn: () => getNutritionPlans(),
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
    mutationFn: createNutritionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-plans'] })
      toast({ title: 'Plan created', description: 'Nutrition plan added successfully.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to create plan', variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNutritionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-plans'] })
      toast({ title: 'Plan deleted', description: 'Nutrition plan removed.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to delete plan', variant: 'destructive' })
    },
  })

  const resetForm = () => {
    setForm({ trainer_id: '', member_id: '', name: '', calories: '', protein: '', carbs: '', fat: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      trainer_id: parseInt(form.trainer_id),
      member_id: parseInt(form.member_id),
      name: form.name,
      calories: parseInt(form.calories),
      protein: parseFloat(form.protein),
      carbs: parseFloat(form.carbs),
      fat: parseFloat(form.fat),
      meals: [],
    })
  }

  const memberList = (members as any)?.items || []
  const trainerList = trainers || []
  const list = plans || []

  const memberName = (id: number) => memberList.find((m: any) => Number(m.id) === id)?.full_name || `Member #${id}`

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nutrition Plans</h1>
          <p className="text-gray-500 mt-1">Create and manage nutrition plans</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Nutrition Plan</DialogTitle>
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
                <Label>Plan Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Muscle Gain Diet" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Calories (kcal)</Label>
                  <Input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="2000" required />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input type="number" step="0.1" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} placeholder="150" required />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input type="number" step="0.1" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} placeholder="250" required />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input type="number" step="0.1" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} placeholder="60" required />
                </div>
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
                <div className="text-sm text-gray-500 mt-1">Total Plans</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Apple className="h-6 w-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {list.length ? Math.round(list.reduce((s: number, p: any) => s + p.calories, 0) / list.length) : 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">Avg Calories</div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Flame className="h-6 w-6 text-green-600" />
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
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Apple className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans List */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Nutrition Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list.map((plan: any, index: number) => (
                <div key={plan.id} className="p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Apple className="h-5 w-5 text-white" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4 text-gray-500" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(String(plan.id))}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">For: <span className="font-medium text-gray-900">{memberName(plan.member_id)}</span></p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Calories</div>
                      <div className="font-semibold text-gray-900">{plan.calories} kcal</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Protein</div>
                      <div className="font-semibold text-gray-900">{plan.protein}g</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Carbs</div>
                      <div className="font-semibold text-gray-900">{plan.carbs}g</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Fat</div>
                      <div className="font-semibold text-gray-900">{plan.fat}g</div>
                    </div>
                  </div>
                </div>
              ))}
              {list.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Apple className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No nutrition plans yet</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
