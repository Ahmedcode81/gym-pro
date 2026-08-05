export interface User {
  id: string
  email: string
  full_name: string
  role: Role
  avatar?: string
  phone?: string
  branch_id?: string
  created_at: string
  updated_at: string
}

export type Role = 'super_admin' | 'owner' | 'branch_manager' | 'receptionist' | 'cashier' | 'trainer' | 'accountant'

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

export interface Member {
  id: string
  full_name: string
  photo?: string
  phone: string
  email?: string
  gender: 'male' | 'female'
  birth_date: string
  address?: string
  emergency_contact?: string
  medical_notes?: string
  height?: number
  weight?: number
  join_date: string
  membership_status: 'active' | 'expired' | 'suspended' | 'pending'
  branch_id: string
  created_at: string
  updated_at: string
}

export interface MembershipPlan {
  id: string
  name: string
  price: number
  duration_days: number
  freeze_days: number
  max_visits?: number
  description?: string
  branch_id: string
  created_at: string
  updated_at: string
}

export interface Membership {
  id: string
  member_id: string
  plan_id: string
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'frozen' | 'cancelled'
  remaining_visits?: number
  freeze_days_used: number
  auto_renew: boolean
  created_at: string
  updated_at: string
}

export interface CheckIn {
  id: string
  member_id: string
  branch_id: string
  entry_time: string
  exit_time?: string
  method: 'qr' | 'barcode' | 'rfid' | 'manual'
  created_at: string
}

export interface Trainer {
  id: string
  name: string
  photo?: string
  phone: string
  email?: string
  salary: number
  specialization: string
  schedule?: string
  branch_id: string
  created_at: string
  updated_at: string
}

export interface WorkoutProgram {
  id: string
  trainer_id: string
  member_id: string
  name: string
  description?: string
  exercises: Exercise[]
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
  rest_time?: number
  notes?: string
}

export interface NutritionPlan {
  id: string
  trainer_id: string
  member_id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  meals: Meal[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface Meal {
  id: string
  name: string
  time: string
  foods: string[]
  calories: number
}

export interface BodyMeasurement {
  id: string
  member_id: string
  date: string
  weight: number
  height: number
  bmi: number
  body_fat?: number
  muscle_mass?: number
  waist?: number
  chest?: number
  arms?: number
  legs?: number
  before_photo?: string
  after_photo?: string
  notes?: string
  created_at: string
}

export interface GroupClass {
  id: string
  name: string
  type: 'yoga' | 'crossfit' | 'zumba' | 'cardio' | 'other'
  trainer_id: string
  branch_id: string
  schedule: string
  capacity: number
  description?: string
  created_at: string
  updated_at: string
}

export interface ClassBooking {
  id: string
  class_id: string
  member_id: string
  date: string
  status: 'booked' | 'attended' | 'cancelled' | 'no_show'
  booking_time: string
  created_at: string
}

export interface Payment {
  id: string
  member_id: string
  membership_id?: string
  amount: number
  method: 'cash' | 'credit_card' | 'bank_transfer' | 'apple_pay'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  invoice_id?: string
  branch_id: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  member_id: string
  payment_id: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_date?: string
  branch_id: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Product {
  id: string
  name: string
  barcode?: string
  category: 'supplements' | 'drinks' | 'merchandise' | 'equipment'
  quantity: number
  supplier?: string
  purchase_price: number
  selling_price: number
  low_stock_threshold: number
  branch_id: string
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  items: SaleItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  payment_method: 'cash' | 'credit_card' | 'bank_transfer' | 'apple_pay'
  status: 'completed' | 'refunded' | 'partial_refund'
  branch_id: string
  cashier_id: string
  created_at: string
  updated_at: string
}

export interface SaleItem {
  product_id: string
  quantity: number
  unit_price: number
  total: number
}

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email?: string
  manager_id?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  member_id: string
  type: 'id' | 'medical_report' | 'contract' | 'image' | 'other'
  file_url: string
  file_name: string
  file_size: number
  uploaded_at: string
}

export interface GymSettings {
  id: string
  name: string
  logo?: string
  address: string
  phone: string
  email?: string
  currency: string
  tax_rate: number
  business_hours: BusinessHours
  languages: string[]
  created_at: string
  updated_at: string
}

export interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  open: string
  close: string
  is_closed: boolean
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource: string
  resource_id: string
  details?: string
  ip_address: string
  user_agent?: string
  created_at: string
}

export interface Notification {
  id: string
  type: 'membership_expiry' | 'birthday' | 'payment_reminder' | 'promotion' | 'system'
  title: string
  message: string
  recipient_id?: string
  recipient_type: 'member' | 'trainer' | 'staff' | 'all'
  channel: 'email' | 'sms' | 'in_app'
  status: 'pending' | 'sent' | 'failed'
  scheduled_at?: string
  sent_at?: string
  created_at: string
}

export interface DashboardStats {
  total_members: number
  active_members: number
  expired_memberships: number
  today_checkins: number
  revenue_today: number
  revenue_this_month: number
  revenue_this_year: number
  membership_statistics: MembershipStatistics
  attendance_chart: ChartData
  sales_chart: ChartData
  trainer_statistics: TrainerStatistics[]
  recent_activities: Activity[]
  notifications: Notification[]
}

export interface MembershipStatistics {
  active: number
  expired: number
  frozen: number
  pending: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

export interface TrainerStatistics {
  trainer_id: string
  trainer_name: string
  total_members: number
  active_programs: number
  revenue_generated: number
}

export interface Activity {
  id: string
  user: string
  action: string
  description: string
  timestamp: string
}
