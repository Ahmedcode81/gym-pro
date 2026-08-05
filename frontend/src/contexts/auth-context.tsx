import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '@/types'
import api from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (resource: string, action: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        const response = await api.get('/auth/me')
        setUser(response.data)
      }
    } catch (error) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    // Backend uses OAuth2PasswordRequestForm (form-urlencoded)
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    const { access_token, refresh_token, user } = response.data

    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false

    // Super admin has all permissions
    if (user.role === 'super_admin') return true

    // For simplicity, define basic permissions based on role
    const rolePermissions: Record<string, string[]> = {
      owner: ['*'],
      branch_manager: ['members.*', 'trainers.*', 'classes.*', 'check-in.*'],
      receptionist: ['members.read', 'check-in.*', 'payments.read'],
      cashier: ['payments.*', 'pos.*'],
      trainer: ['workout-programs.*', 'nutrition-plans.*', 'body-measurements.*'],
      accountant: ['payments.*', 'reports.*', 'inventory.*'],
    }

    const permissions = rolePermissions[user.role as string] || []

    return permissions.some((perm) => {
      if (perm === '*') return true
      if (perm === `${resource}.*`) return true
      return perm === `${resource}.${action}`
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
