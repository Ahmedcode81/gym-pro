import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogIn,
  Dumbbell,
  ClipboardList,
  Apple,
  Ruler,
  Calendar,
  DollarSign,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Globe,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'Main' },
  { name: 'Members', href: '/members', icon: Users, section: 'Main' },
  { name: 'Membership Plans', href: '/membership-plans', icon: CreditCard, section: 'Main' },
  { name: 'Check In', href: '/check-in', icon: LogIn, section: 'Main' },
  { name: 'Trainers', href: '/trainers', icon: Dumbbell, section: 'Training' },
  { name: 'Workout Programs', href: '/workout-programs', icon: ClipboardList, section: 'Training' },
  { name: 'Nutrition Plans', href: '/nutrition-plans', icon: Apple, section: 'Training' },
  { name: 'Body Measurements', href: '/body-measurements', icon: Ruler, section: 'Training' },
  { name: 'Group Classes', href: '/group-classes', icon: Calendar, section: 'Classes' },
  { name: 'Payments', href: '/payments', icon: DollarSign, section: 'Finance' },
  { name: 'POS', href: '/pos', icon: ShoppingCart, section: 'Finance' },
  { name: 'Inventory', href: '/inventory', icon: Package, section: 'Finance' },
  { name: 'Reports', href: '/reports', icon: BarChart3, section: 'Analytics' },
  { name: 'Settings', href: '/settings', icon: Settings, section: 'System' },
]

// Primary items shown in the mobile bottom nav (max 5)
const bottomNavItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Check-in', href: '/check-in', icon: LogIn },
  { name: 'Payments', href: '/payments', icon: DollarSign },
  { name: 'More', href: '', icon: MoreHorizontal, section: 'more' },
]

function getCurrentSection(pathname: string) {
  const match = navigation.find((item) => item.href === pathname)
  return match?.section || 'Main'
}

function getCurrentPageName(pathname: string) {
  const match = navigation.find((item) => item.href === pathname)
  return match?.name || 'Dashboard'
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const sections = [...new Set(navigation.map(item => item.section))]

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-16 md:pb-0">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-[#172B4D] transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center shadow-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              {!sidebarCollapsed && (
                <h1 className="text-2xl font-bold text-white">GymPro</h1>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10 rounded-full tap-target"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {sections.map((section) => (
              <div key={section}>
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                    {section}
                  </h3>
                )}
                <div className="space-y-1">
                  {navigation
                    .filter(item => item.section === section)
                    .map((item) => {
                      const Icon = item.icon
                      const isActive = location.pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`sidebar-link ${
                            isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                          }`}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          {!sidebarCollapsed && <span>{item.name}</span>}
                        </Link>
                      )
                    })}
                </div>
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-[#2563EB] text-white">{getInitials(user?.full_name)}</AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role?.replace(/_/g, ' ') || 'Member'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 md:h-20 glass-effect border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-gray-100 rounded-full tap-target"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex hover:bg-gray-100 rounded-full tap-target"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>

              {/* Mobile title */}
              <div className="lg:hidden min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">{getCurrentPageName(location.pathname)}</h2>
                <p className="text-xs text-gray-500 capitalize truncate">{getCurrentSection(location.pathname)}</p>
              </div>

              {/* Desktop search */}
              <div className="hidden md:relative md:flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile search icon */}
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-gray-100 rounded-full tap-target">
                <Search className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-gray-100 rounded-full tap-target relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-gray-100 rounded-full tap-target relative">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-gray-100 rounded-full tap-target">
                <Globe className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-gray-100 rounded-full tap-target">
                <Sun className="h-5 w-5 text-gray-600" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full tap-target">
                    <Avatar>
                      <AvatarFallback className="bg-[#2563EB] text-white">{getInitials(user?.full_name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav">
        <div className="flex items-stretch">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            if (item.section === 'more') {
              return (
                <button
                  key={item.name}
                  onClick={() => setSidebarOpen(true)}
                  className={`bottom-nav-item ${sidebarOpen ? 'bottom-nav-item-active' : ''}`}
                >
                  <Icon className="h-5 w-5 mb-0.5" />
                  <span>{item.name}</span>
                </button>
              )
            }
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

