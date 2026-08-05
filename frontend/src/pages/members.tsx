import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Plus, Search, Mail, Phone, Calendar, MoreVertical, Loader2, Pencil, Trash2, Upload } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { getMembers, createMember, updateMember, deleteMember } from '@/lib/service'
import { useAuth } from '@/contexts/auth-context'

export default function Members() {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: 'male',
    birth_date: '',
    address: '',
    emergency_contact: '',
    height: '',
    weight: '',
  })

  const branchId = user?.branch_id ? Number(user.branch_id) : 1

  const { data, isLoading, isError } = useQuery({
    queryKey: ['members', search],
    queryFn: () => getMembers({ search: search || undefined, page: 1, page_size: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast({ title: 'Member added', description: 'Member created successfully.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to create member', variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast({ title: 'Member updated', description: 'Member updated successfully.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to update member', variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast({ title: 'Member deleted', description: 'Member removed successfully.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to delete member', variant: 'destructive' })
    },
  })

  const resetForm = () => {
    setEditingMember(null)
    setForm({
      full_name: '', phone: '', email: '', gender: 'male', birth_date: '',
      address: '', emergency_contact: '', height: '', weight: '',
    })
  }

  const handleEdit = (member: any) => {
    setEditingMember(member)
    setForm({
      full_name: member.full_name,
      phone: member.phone,
      email: member.email || '',
      gender: member.gender,
      birth_date: member.birth_date,
      address: member.address || '',
      emergency_contact: member.emergency_contact || '',
      height: member.height ? String(member.height) : '',
      weight: member.weight ? String(member.weight) : '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || undefined,
      gender: form.gender,
      birth_date: form.birth_date,
      address: form.address || undefined,
      emergency_contact: form.emergency_contact || undefined,
      height: form.height ? parseFloat(form.height) : undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      branch_id: branchId,
    }

    if (editingMember) {
      updateMutation.mutate({ id: Number(editingMember.id), data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const members = data?.items || []
  const total = data?.total || 0
  const activeCount = members.filter((m: any) => m.membership_status === 'active').length
  const expiredCount = members.filter((m: any) => m.membership_status === 'expired').length

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-500 mt-1">Manage your gym members</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Member name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone *</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1234567890" required />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="member@example.com" />
                  </div>
                  <div>
                    <Label>Gender *</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Birth Date *</Label>
                    <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Height (cm)</Label>
                    <Input type="number" step="0.1" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="175" />
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="75" />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" />
                </div>
                <div>
                  <Label>Emergency Contact</Label>
                  <Input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} placeholder="Emergency contact" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {editingMember ? 'Update Member' : 'Add Member'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{total}</div>
                <div className="text-sm text-gray-500 mt-1">Total Members</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{activeCount}</div>
                <div className="text-sm text-gray-500 mt-1">Active</div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{expiredCount}</div>
                <div className="text-sm text-gray-500 mt-1">Expired</div>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{members.length}</div>
                <div className="text-sm text-gray-500 mt-1">Displayed</div>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Plus className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card className="stat-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">All Members</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="pl-10 h-10 w-64 border-gray-200 focus:border-[#2563EB]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : isError ? (
            <div className="text-center py-12 text-gray-500"><p>Failed to load members. Make sure the backend is running.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Member</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Gender</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Join Date</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member: any, index: number) => (
                    <tr key={member.id} className="border-b border-gray-100 table-row-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[#2563EB] text-white">
                              {member.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900">{member.full_name}</div>
                            <div className="text-sm text-gray-500">ID: #{member.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {member.phone}
                          </div>
                          {member.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4 text-gray-400" />
                              {member.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          member.membership_status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : member.membership_status === 'expired'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {member.membership_status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 capitalize">{member.gender}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {member.join_date}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                              <MoreVertical className="h-5 w-5 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(member)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Member
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(String(member.id))}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-500">No members found</td></tr>
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
