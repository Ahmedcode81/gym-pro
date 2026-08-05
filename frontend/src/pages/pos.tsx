import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingCart, Plus, Search, Minus, Trash2, Loader2, Receipt, CheckCircle2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { getProducts, createSale, getSales } from '@/lib/service'
import { useAuth } from '@/contexts/auth-context'

export default function POS() {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([])
  const [paymentMethod, setPaymentMethod] = useState('cash')

  const branchId = user?.branch_id ? Number(user.branch_id) : 1
  const cashierId = user?.id ? Number(user.id) : 1

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => getProducts({ search: search || undefined }),
  })

  const { data: sales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => getSales(),
  })

  const saleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({ title: 'Sale completed', description: 'Transaction processed successfully.' })
      setCart([])
    },
    onError: (err: any) => {
      toast({ title: 'Sale failed', description: err?.response?.data?.detail || 'Failed to process sale', variant: 'destructive' })
    },
  })

  const list = products || []
  const filtered = list.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta
          if (newQty <= 0) return null as any
          return { ...item, quantity: newQty }
        }
        return item
      }).filter(Boolean)
    )
  }

  const removeItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ title: 'Cart is empty', description: 'Add products to the cart first.', variant: 'destructive' })
      return
    }
    saleMutation.mutate({
      items: cart.map((item) => ({
        product_id: Number(item.product.id),
        quantity: item.quantity,
        unit_price: item.product.selling_price,
        total: item.product.selling_price * item.quantity,
      })),
      subtotal,
      tax,
      discount: 0,
      total,
      payment_method: paymentMethod,
      branch_id: branchId,
      cashier_id: cashierId,
    })
  }

  const todaySales = (sales || []).filter((s: any) => new Date(s.created_at).toDateString() === new Date().toDateString())
  const todayRevenue = todaySales.reduce((sum: number, s: any) => sum + s.total, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-500 mt-1">Process sales and transactions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">${todayRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">Today's Sales</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-[#2563EB]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{todaySales.length}</div>
                <div className="text-sm text-gray-500 mt-1">Transactions</div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{cart.length}</div>
                <div className="text-sm text-gray-500 mt-1">Cart Items</div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products */}
        <Card className="stat-card lg:col-span-2">
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
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filtered.map((product: any, index: number) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.quantity <= 0}
                    className="p-4 rounded-xl border border-gray-200 hover:border-[#2563EB] hover:bg-blue-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500 mt-1">${product.selling_price}</div>
                    <div className="text-xs mt-2 flex items-center gap-1">
                      <span className={product.quantity <= product.low_stock_threshold ? 'text-red-500' : 'text-green-600'}>
                        {product.quantity} in stock
                      </span>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">No products found</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cart */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#2563EB]" />
              Cart / Checkout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{item.product.name}</div>
                    <div className="text-xs text-gray-500">${item.product.selling_price} each</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(Number(item.product.id), -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(Number(item.product.id), 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">
                    ${(item.product.selling_price * item.quantity).toFixed(2)}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeItem(Number(item.product.id))}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Cart is empty</p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="apple_pay">Apple Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCheckout} disabled={saleMutation.isPending || cart.length === 0} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-12">
              {saleMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
              Complete Sale
            </Button>
          </CardContent>
        </Card>
      </div>
</div>
  )
}
