import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

export type Role = 'super_admin' | 'admin' | 'manager' | 'trainer' | 'staff' | 'member'

export type Permission =
  | 'view_dashboard'
  | 'manage_members'
  | 'manage_memberships'
  | 'check_in_members'
  | 'manage_trainers'
  | 'manage_classes'
  | 'view_reports'
  | 'manage_payments'
  | 'manage_inventory'
  | 'manage_settings'

interface AccessControlContextType {
  role: Role
  permissions: Permission[]
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: Role) => boolean
  hasAnyRole: (roles: Role[]) => boolean
}

const rolePermissions: Record<Role, Permission[]> = {
  super_admin: [
    'view_dashboard',
    'manage_members',
    'manage_memberships',
    'check_in_members',
    'manage_trainers',
    'manage_classes',
    'view_reports',
    'manage_payments',
    'manage_inventory',
    'manage_settings',
  ],
  admin: [
    'view_dashboard',
    'manage_members',
    'manage_memberships',
    'check_in_members',
    'manage_trainers',
    'manage_classes',
    'view_reports',
    'manage_payments',
    'manage_inventory',
  ],
  manager: [
    'view_dashboard',
    'manage_members',
    'manage_memberships',
    'check_in_members',
    'manage_classes',
    'view_reports',
    'manage_payments',
  ],
  trainer: [
    'view_dashboard',
    'check_in_members',
    'manage_classes',
  ],
  staff: [
    'view_dashboard',
    'check_in_members',
  ],
  member: [
    'view_dashboard',
  ],
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined)

export function AccessControlProvider({ 
  children, 
  role = 'member' 
}: { 
  children: ReactNode
  role?: Role 
}) {
  const permissions = rolePermissions[role] || []

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission)
  }

  const hasRole = (checkRole: Role): boolean => {
    return role === checkRole
  }

  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.includes(role)
  }

  return (
    <AccessControlContext.Provider
      value={{ role, permissions, hasPermission, hasRole, hasAnyRole }}
    >
      {children}
    </AccessControlContext.Provider>
  )
}

export function useAccessControl() {
  const context = useContext(AccessControlContext)
  if (context === undefined) {
    throw new Error('useAccessControl must be used within an AccessControlProvider')
  }
  return context
}