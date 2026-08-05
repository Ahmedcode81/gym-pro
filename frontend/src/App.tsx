import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout'
import Login from '@/pages/auth/login'
import Dashboard from '@/pages/dashboard'
import Members from '@/pages/members'
import MembershipPlans from '@/pages/membership-plans'
import CheckIn from '@/pages/check-in'
import Trainers from '@/pages/trainers'
import WorkoutPrograms from '@/pages/workout-programs'
import NutritionPlans from '@/pages/nutrition-plans'
import BodyMeasurements from '@/pages/body-measurements'
import GroupClasses from '@/pages/group-classes'
import Payments from '@/pages/payments'
import POS from '@/pages/pos'
import Inventory from '@/pages/inventory'
import Reports from '@/pages/reports'
import SettingsPage from '@/pages/settings'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F7FA]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Layout />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/membership-plans" element={<MembershipPlans />} />
        <Route path="/check-in" element={<CheckIn />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/workout-programs" element={<WorkoutPrograms />} />
        <Route path="/nutrition-plans" element={<NutritionPlans />} />
        <Route path="/body-measurements" element={<BodyMeasurements />} />
        <Route path="/group-classes" element={<GroupClasses />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
