import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Plus, Search, MoreVertical, Loader2, Pencil, Trash2, TrendingDown, AlertTriangle } from 'lucide-react'
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
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/service'
import { useAuth } from '@/contexts/auth-context'

const categoryColors: Record<string, string> = {
  supplements: 'bg-blue-100 text-blue-700',
  drinks: 'bg-green-100 text-green-700',
  merchandise: 'bg-purple-100 text-purple-700',
  equipment: 'bg-yellow-100 text-yellow-700',
}

export default function Inventory() {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    barcode: '',
    category: 'supplements',
    quantity: '',
    supplier: '',
    purchase_price: '',
    selling_price: '',
    low_stock_threshold: '10',
  })

  const branchId = user?.branch_id ? Number(user.branch_id) : 1

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products', search],
    queryFn: () => getProducts({ search: search || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({ title: 'Product added', description: 'Product created successfully.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to create product', variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({ title: 'Product updated', description: 'Product updated successfully.' })
      setDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to update product', variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({ title: 'Product deleted', description: 'Product removed successfully.' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.response?.data?.detail || 'Failed to delete product', variant: 'destructive' })
    },
  })

  const resetForm = () => {
    setEditingProduct(null)
    setForm({
      name: '', barcode: '', category: 'supplements', quantity: '',
      supplier: '', purchase_price: '', selling_price: '', low_stock_threshold: '10',
    })
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      barcode: product.barcode || '',
      category: product.category,
      quantity: String(product.quantity),
      supplier: product.supplier || '',
      purchase_price: String(product.purchase_price),
      selling_price: String(product.selling_price),
      low_stock_threshold: String(product.low_stock_threshold),
    })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      barcode: form.barcode || undefined,
      category: form.category,
      quantity: parseInt(form.quantity),
      supplier: form.supplier || undefined,
      purchase_price: parseFloat(form.purchase_price),
      selling_price: parseFloat(form.selling_price),
      low_stock_threshold: parseInt(form.low_stock_threshold || '10'),
      branch_id: branchId,
    }

    if (editingProduct) {
      updateMutation.mutate({ id: Number(editingProduct.id), data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const list = products || []
  const lowStock = list.filter((p: any) => p.quantity <= p.low_stock_threshold)
  const totalValue = list.reduce((s: number, p: any) => s + (p.quantity * p.purchase_price), 0)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage products and stock</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Barcode</Label>
                  <Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="Barcode" />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplements">Supplements</SelectItem>
                      <SelectItem value="drinks">Drinks</SelectItem>
                      <SelectItem value="merchandise">Merchandise</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity *</Label>
                  <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="100" required />
                </div>
                <div>
                  <Label>Low Stock Threshold</Label>
                  <Input type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} placeholder="10" />
                </div>
                <div>
                  <Label>Purchase Price ($) *</Label>
                  <Input type="number" step="0.01" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} placeholder="5.00" required />
                </div>
                <div>
                  <Label>Selling Price ($) *</Label>
                  <Input type="number" step="0.01" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} placeholder="10.00" required />
                </div>
              </div>
              <div>
                <Label>Supplier</Label>
                <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editingProduct ? 'Update Product' : 'Add Product'}
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
                <div className="text-sm text-gray-500 mt-1">Total Products</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">Inventory Value</div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{lowStock.length}</div>
                <div className="text-sm text-gray-500 mt-1">Low Stock</div>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="stat-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Products</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-10 h-10 w-64 border-gray-200" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : isError ? (
            <div className="text-center py-12 text-gray-500"><p>Failed to load products. Make sure the backend is running.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Product</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Purchase</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Selling</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((product: any, index: number) => {
                    const isLow = product.quantity <= product.low_stock_threshold
                    return (
                      <tr key={product.id} className="border-b border-gray-100 table-row-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.barcode || 'No barcode'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[product.category]}`}>{product.category}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{product.quantity}</span>
                            {isLow && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                          {isLow && <div className="text-xs text-red-500">Low stock</div>}
                        </td>
                        <td className="py-4 px-4 text-gray-600">${product.purchase_price}</td>
                        <td className="py-4 px-4 font-semibold text-gray-900">${product.selling_price}</td>
                        <td className="py-4 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-gray-100"><MoreVertical className="h-5 w-5 text-gray-500" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(product)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(String(product.id))}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                  {list.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-500">No products found</td></tr>
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
