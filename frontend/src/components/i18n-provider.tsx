import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ar'

type I18nProviderProps = {
  children: React.ReactNode
}

type I18nProviderState = {
  language: Language
  setLanguage: (language: Language) => void
  isRTL: boolean
}

const translations = {
  en: {
    dashboard: 'Dashboard',
    members: 'Members',
    membershipPlans: 'Membership Plans',
    checkIn: 'Check In',
    trainers: 'Trainers',
    workoutPrograms: 'Workout Programs',
    nutritionPlans: 'Nutrition Plans',
    bodyMeasurements: 'Body Measurements',
    groupClasses: 'Group Classes',
    payments: 'Payments',
    pos: 'Point of Sale',
    inventory: 'Inventory',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember me',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    totalMembers: 'Total Members',
    activeMembers: 'Active Members',
    expiredMemberships: 'Expired Memberships',
    todayCheckins: "Today's Check-ins",
    revenueToday: 'Revenue Today',
    revenueThisMonth: 'Revenue This Month',
    revenueThisYear: 'Revenue This Year',
    search: 'Search',
    filter: 'Filter',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    noData: 'No data available',
    error: 'An error occurred',
    success: 'Success',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    members: 'الأعضاء',
    membershipPlans: 'خطط العضوية',
    checkIn: 'تسجيل الدخول',
    trainers: 'المدربين',
    workoutPrograms: 'برامج التمارين',
    nutritionPlans: 'خطط التغذية',
    bodyMeasurements: 'قياسات الجسم',
    groupClasses: 'الفصول الجماعية',
    payments: 'المدفوعات',
    pos: 'نقطة البيع',
    inventory: 'المخزون',
    reports: 'التقارير',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    rememberMe: 'تذكرني',
    noAccount: 'ليس لديك حساب؟',
    signUp: 'إنشاء حساب',
    totalMembers: 'إجمالي الأعضاء',
    activeMembers: 'الأعضاء النشطون',
    expiredMemberships: 'العضويات المنتهية',
    todayCheckins: 'تسجيلات الدخول اليوم',
    revenueToday: 'إيرادات اليوم',
    revenueThisMonth: 'إيرادات هذا الشهر',
    revenueThisYear: 'إيرادات هذا العام',
    search: 'بحث',
    filter: 'تصفية',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    loading: 'جاري التحميل...',
    noData: 'لا توجد بيانات',
    error: 'حدث خطأ',
    success: 'نجاح',
  },
}

const I18nContext = createContext<I18nProviderState | undefined>(undefined)

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('gym-language') as Language) || 'en'
  })

  useEffect(() => {
    localStorage.setItem('gym-language', language)
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const value = {
    language,
    setLanguage,
    isRTL: language === 'ar',
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  
  const t = (key: string) => {
    return translations[context.language][key as keyof typeof translations.en] || key
  }

  return {
    ...context,
    t,
  }
}
