import api from './api'
import type {
  Membership,
  DashboardStats,
  AuditLog,
} from '@/types'

// Auth
export const me = () => api.get('/auth/me').then((r) => r.data)

// Members
export const getMembers = (params?: any) =>
  api.get('/members', { params }).then((r) => r.data)
export const getMember = (id: number | string) =>
  api.get(`/members/${id}`).then((r) => r.data)
export const createMember = (data: any) =>
  api.post('/members', data).then((r) => r.data)
export const updateMember = (id: number | string, data: any) =>
  api.put(`/members/${id}`, data).then((r) => r.data)
export const deleteMember = (id: number | string) =>
  api.delete(`/members/${id}`).then((r) => r.data)

// Membership Plans
export const getMembershipPlans = () =>
  api.get('/memberships/plans').then((r) => r.data)
export const createMembershipPlan = (data: any) =>
  api.post('/memberships/plans', data).then((r) => r.data)
export const updateMembershipPlan = (id: number | string, data: any) =>
  api.put(`/memberships/plans/${id}`, data).then((r) => r.data)
export const deleteMembershipPlan = (id: number | string) =>
  api.delete(`/memberships/plans/${id}`).then((r) => r.data)

// Memberships
export const getMemberships = (params?: any) =>
  api.get('/memberships', { params }).then((r) => r.data)
export const createMembership = (data: Partial<Membership>) =>
  api.post('/memberships', data).then((r) => r.data)
export const updateMembership = (id: number | string, data: Partial<Membership>) =>
  api.put(`/memberships/${id}`, data).then((r) => r.data)

// Check-ins
export const getCheckins = (params?: any) =>
  api.get('/checkins', { params }).then((r) => r.data)
export const createCheckin = (data: any) =>
  api.post('/checkins', data).then((r) => r.data)
export const checkout = (id: number | string) =>
  api.post(`/checkins/${id}/checkout`).then((r) => r.data)

// Trainers
export const getTrainers = () => api.get('/trainers').then((r) => r.data)
export const createTrainer = (data: any) =>
  api.post('/trainers', data).then((r) => r.data)
export const updateTrainer = (id: number | string, data: any) =>
  api.put(`/trainers/${id}`, data).then((r) => r.data)
export const deleteTrainer = (id: number | string) =>
  api.delete(`/trainers/${id}`).then((r) => r.data)

// Workout Programs
export const getWorkoutPrograms = (params?: any) =>
  api.get('/workouts', { params }).then((r) => r.data)
export const createWorkoutProgram = (data: any) =>
  api.post('/workouts', data).then((r) => r.data)
export const updateWorkoutProgram = (id: number | string, data: any) =>
  api.put(`/workouts/${id}`, data).then((r) => r.data)
export const deleteWorkoutProgram = (id: number | string) =>
  api.delete(`/workouts/${id}`).then((r) => r.data)

// Nutrition Plans
export const getNutritionPlans = (params?: any) =>
  api.get('/nutrition', { params }).then((r) => r.data)
export const createNutritionPlan = (data: any) =>
  api.post('/nutrition', data).then((r) => r.data)
export const updateNutritionPlan = (id: number | string, data: any) =>
  api.put(`/nutrition/${id}`, data).then((r) => r.data)
export const deleteNutritionPlan = (id: number | string) =>
  api.delete(`/nutrition/${id}`).then((r) => r.data)

// Body Measurements
export const getBodyMeasurements = (memberId?: number | string) =>
  api.get('/measurements', { params: memberId ? { member_id: memberId } : {} }).then((r) => r.data)
export const createBodyMeasurement = (data: any) =>
  api.post('/measurements', data).then((r) => r.data)
export const updateBodyMeasurement = (id: number | string, data: any) =>
  api.put(`/measurements/${id}`, data).then((r) => r.data)
export const deleteBodyMeasurement = (id: number | string) =>
  api.delete(`/measurements/${id}`).then((r) => r.data)

// Group Classes
export const getGroupClasses = (params?: any) =>
  api.get('/classes', { params }).then((r) => r.data)
export const createGroupClass = (data: any) =>
  api.post('/classes', data).then((r) => r.data)
export const updateGroupClass = (id: number | string, data: any) =>
  api.put(`/classes/${id}`, data).then((r) => r.data)
export const deleteGroupClass = (id: number | string) =>
  api.delete(`/classes/${id}`).then((r) => r.data)
export const getClassBookings = (classId: number | string) =>
  api.get(`/classes/${classId}/bookings`).then((r) => r.data)
export const createClassBooking = (classId: number | string, data: any) =>
  api.post(`/classes/${classId}/bookings`, data).then((r) => r.data)

// Payments
export const getPayments = (params?: any) =>
  api.get('/payments', { params }).then((r) => r.data)
export const createPayment = (data: any) =>
  api.post('/payments', data).then((r) => r.data)
export const refundPayment = (id: number | string) =>
  api.post(`/payments/${id}/refund`).then((r) => r.data)

// POS / Sales
export const getSales = (params?: any) =>
  api.get('/pos', { params }).then((r) => r.data)
export const createSale = (data: any) =>
  api.post('/pos', data).then((r) => r.data)
export const returnSale = (id: number | string) =>
  api.post(`/pos/${id}/return`).then((r) => r.data)

// Inventory
export const getProducts = (params?: any) =>
  api.get('/inventory', { params }).then((r) => r.data)
export const createProduct = (data: any) =>
  api.post('/inventory', data).then((r) => r.data)
export const updateProduct = (id: number | string, data: any) =>
  api.put(`/inventory/${id}`, data).then((r) => r.data)
export const deleteProduct = (id: number | string) =>
  api.delete(`/inventory/${id}`).then((r) => r.data)

// Reports
export const getRevenueReport = (params: any) =>
  api.get('/reports/revenue', { params }).then((r) => r.data)
export const getMembershipReport = (params?: any) =>
  api.get('/reports/membership', { params }).then((r) => r.data)
export const getAttendanceReport = (params: any) =>
  api.get('/reports/attendance', { params }).then((r) => r.data)
export const getSalesReport = (params: any) =>
  api.get('/reports/sales', { params }).then((r) => r.data)
export const getInventoryReport = (params?: any) =>
  api.get('/reports/inventory', { params }).then((r) => r.data)
export const getTrainersReport = (params?: any) =>
  api.get('/reports/trainers', { params }).then((r) => r.data)

// Settings
export const getGymSettings = () =>
  api.get('/settings').then((r) => r.data)
export const updateGymSettings = (data: any) =>
  api.put('/settings', data).then((r) => r.data)
export const getBranches = () =>
  api.get('/settings/branches').then((r) => r.data)

// Dashboard
export const getDashboardStats = (): Promise<DashboardStats> =>
  api.get('/dashboard/stats').then((r) => r.data)

// Audit
export const getAuditLogs = (params?: any) =>
  api.get('/audit', { params }).then((r) => r.data)

export type { DashboardStats, AuditLog }
