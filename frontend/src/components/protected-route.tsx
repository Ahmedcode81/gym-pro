import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAccessControl } from '@/contexts/access-control'
import type { Permission } from '@/contexts/access-control'

interface ProtectedRouteProps {
  children: ReactNode
  permission?: Permission
  roles?: string[]
  fallback?: ReactNode
}

export function ProtectedRoute({ 
  children, 
  permission, 
  roles,
  fallback 
}: ProtectedRouteProps) {
  const { hasPermission, hasAnyRole } = useAccessControl()

  // Check role-based access
  if (roles && roles.length > 0) {
    const hasRequiredRole = hasAnyRole(roles as any)
    if (!hasRequiredRole) {
      return fallback || <Navigate to="/dashboard" replace />
    }
  }

  // Check permission-based access
  if (permission) {
    const hasRequiredPermission = hasPermission(permission)
    if (!hasRequiredPermission) {
      return fallback || <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
