import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings as SettingsIcon, Building2, Loader2, Save, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getGymSettings, updateGymSettings, getBranches } from '@/lib/service'

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export default function SettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<any>(null)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getGymSettings,
  })

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  })

  useEffect(() => {
    if (settings && !form) {
      setForm({
        name: settings.name,
        address: settings.address,
        phone: settings.phone,
        email: settings.email || '',
        currency: settings.currency,
        tax_rate: String(settings.tax_rate * 100),
      })
    }
  }, [settings])

  const updateMutation = useMutation({
    mutationFn: updateGymSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast({ title: 'Settings saved', description: 'Gym settings updated successfully.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to save settings', variant: 'destructive' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    updateMutation.mutate({
      name: form.name,
      address: form.address,
      phone: form.phone,
      email: form.email || undefined,
      currency: form.currency,
      tax_rate: parseFloat(form.tax_rate || '0') / 100,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your gym</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gym Settings */}
        <Card className="stat-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-[#2563EB]" />
              Gym Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {form && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Gym Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                  <div className="col-span-2">
                    <Label>Address *</Label>
                    <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Currency</Label>
                      <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
                    </div>
                    <div>
                      <Label>Tax Rate (%)</Label>
                      <Input type="number" step="0.1" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Settings
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Branches */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Branches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(branches || []).map((branch: any) => (
                <div key={branch.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="font-semibold text-gray-900">{branch.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{branch.address}</div>
                  <div className="text-sm text-gray-500">{branch.phone}</div>
                </div>
              ))}
              {(branches || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No branches found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Hours */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Day</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Open</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Close</th>
                </tr>
              </thead>
              <tbody>
                {settings?.business_hours && days.map((day) => {
                  const hours = settings.business_hours[day]
                  return (
                    <tr key={day} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900 capitalize">{day}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${hours?.is_closed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {hours?.is_closed ? 'Closed' : 'Open'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{hours?.open || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{hours?.close || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
