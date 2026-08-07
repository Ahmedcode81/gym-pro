/* ============================================================
   GymPro - i18n (English / Arabic) with RTL support
   ============================================================ */
const GymProI18n = (() => {
  const STORAGE_KEY = 'gympro_lang';
  const LANGS = ['en', 'ar'];

  const translations = {
    en: {
      // App / layout
      appName: 'GymPro',
      searchAnything: 'Search anything...',
      notifications: 'Notifications',
      messages: 'Messages',
      theme: 'Theme',
      account: 'Account',
      logout: 'Logout',
      // Sidebar sections
      sectionMain: 'Main',
      sectionManagement: 'Management',
      sectionOperations: 'Operations',
      sectionTraining: 'Training',
      sectionFinance: 'Finance',
      sectionAnalytics: 'Analytics',
      sectionSystem: 'System',
      // Sidebar routes
      Dashboard: 'Dashboard',
      Members: 'Members',
      'Membership Plans': 'Membership Plans',
      'Check In': 'Check In',
      Trainers: 'Trainers',
      'Workout Programs': 'Workout Programs',
      'Nutrition Plans': 'Nutrition Plans',
      'Body Measurements': 'Body Measurements',
      'Group Classes': 'Group Classes',
      Payments: 'Payments',
      'Point of Sale': 'Point of Sale',
      Inventory: 'Inventory',
      Equipment: 'Equipment',
      Reports: 'Reports',
      Users: 'Users',
      Branches: 'Branches',
      Settings: 'Settings',
      // Login
      welcomeBack: 'Welcome back',
      loginSub: 'Sign in to the gym management system',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      quickDemoLogin: 'Quick demo login',
      invalidCredentials: 'Invalid email or password',
      welcomeBackToast: 'Welcome back!',
      signedIn: 'Signed in successfully',
      demoAccounts: 'Demo Accounts',
      // Toasts
      exportComplete: 'Export complete',
      noExport: 'Nothing to export',
      // Common
      cancel: 'Cancel',
      save: 'Save',
      saveChanges: 'Save Changes',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      export: 'Export',
      search: 'Search',
      results: 'results',
      pageOf: 'Page {page} of {total}',
      all: 'All',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      expired: 'Expired',
      completed: 'Completed',
      failed: 'Failed',
      noData: 'No data found',
      confirm: 'Confirm',
      loading: 'Loading',
      failed: 'Failed to load page.',
      reload: 'Reload',
      // Dashboard
      dashboardWelcome: 'Welcome back! Here\'s what\'s happening at your gym today.',
      checkInMember: 'Check In Member',
      viewMembers: 'View Members',
      totalMembers: 'Total Members',
      activeMembers: 'active',
      todaysCheckins: 'Today\'s Check-ins',
      classesToday: 'classes today',
      revenueToday: 'Revenue Today',
      revenueThisMonth: 'this month',
      trainers: 'Trainers',
      classes: 'classes',
      revenueLast7Days: 'Revenue (Last 7 days)',
      attendanceLast7Days: 'Attendance (Last 7 days)',
      membershipStatus: 'Membership Status',
      membersCount: 'Members',
      inventoryAlerts: 'Inventory Alerts',
      itemsLowStock: 'Items low on stock',
      equipmentMaintenance: 'Equipment needs maintenance',
      activeClasses: 'Active classes',
      recentActivity: 'Recent Activity',
      newMemberRegistered: 'New member registered',
      membershipPaymentReceived: 'Membership payment received',
      groupClassScheduled: 'Group class scheduled',
      inventoryRestocked: 'Inventory restocked',
      equipmentMaintenanceCompleted: 'Equipment maintenance completed',
      newMembershipPlanCreated: 'New membership plan created',
      memberCheckedIn: 'Member checked in',
      workoutProgramUpdated: 'Workout program updated',
      // Members
      memberName: 'Member Name',
      memberEmail: 'Email',
      memberPhone: 'Phone',
      membershipStatus: 'Membership Status',
      joinDate: 'Join Date',
      expiryDate: 'Expiry Date',
      branch: 'Branch',
      addMember: 'Add Member',
      editMember: 'Edit Member',
      deleteMember: 'Delete Member',
      // Membership Plans
      planName: 'Plan Name',
      price: 'Price',
      duration: 'Duration',
      perks: 'Perks',
      addPlan: 'Add Plan',
      editPlan: 'Edit Plan',
      deletePlan: 'Delete Plan',
      // Trainers
      trainerName: 'Trainer Name',
      specialty: 'Specialty',
      experience: 'Experience',
      hourlyRate: 'Hourly Rate',
      addTrainer: 'Add Trainer',
      editTrainer: 'Edit Trainer',
      deleteTrainer: 'Delete Trainer',
      // Payments
      paymentAmount: 'Amount',
      paymentMethod: 'Payment Method',
      paymentDate: 'Date',
      paymentStatus: 'Status',
      addPayment: 'Add Payment',
      editPayment: 'Edit Payment',
      deletePayment: 'Delete Payment',
      // Classes
      className: 'Class Name',
      classSchedule: 'Schedule',
      classTrainer: 'Trainer',
      classCapacity: 'Capacity',
      addClass: 'Add Class',
      editClass: 'Edit Class',
      deleteClass: 'Delete Class',
      // Reports
      reportType: 'Report Type',
      dateRange: 'Date Range',
      generateReport: 'Generate Report',
      exportReport: 'Export Report',
      // Settings
      gymName: 'Gym Name',
      currency: 'Currency',
      timezone: 'Timezone',
      language: 'Language',
      saveSettings: 'Save Settings',
      // Roles
      superAdmin: 'Super Admin',
      owner: 'Owner',
      branchManager: 'Branch Manager',
      receptionist: 'Receptionist',
      trainer: 'Trainer',
      accountant: 'Accountant',
    },
    ar: {
      // App / layout
      appName: 'GymPro',
      searchAnything: 'ابحث عن أي شيء...',
      notifications: 'الإشعارات',
      messages: 'الرسائل',
      theme: 'المظهر',
      account: 'الحساب',
      logout: 'تسجيل الخروج',
      // Sidebar sections
      sectionMain: 'الرئيسية',
      sectionManagement: 'الإدارة',
      sectionOperations: 'العمليات',
      sectionTraining: 'التدريب',
      sectionFinance: 'المالية',
      sectionAnalytics: 'التحليلات',
      sectionSystem: 'النظام',
      // Sidebar routes
      Dashboard: 'لوحة التحكم',
      Members: 'الأعضاء',
      'Membership Plans': 'خطط العضوية',
      'Check In': 'تسجيل الحضور',
      Trainers: 'المدربون',
      'Workout Programs': 'برامج التمارين',
      'Nutrition Plans': 'خطط التغذية',
      'Body Measurements': 'قياسات الجسم',
      'Group Classes': 'الحصص الجماعية',
      Payments: 'المدفوعات',
      'Point of Sale': 'نقطة البيع',
      Inventory: 'المخزون',
      Equipment: 'المعدات',
      Reports: 'التقارير',
      Users: 'المستخدمون',
      Branches: 'الفروع',
      Settings: 'الإعدادات',
      // Login
      welcomeBack: 'مرحباً بعودتك',
      loginSub: 'سجّل الدخول إلى نظام إدارة الصالات',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      signIn: 'تسجيل الدخول',
      quickDemoLogin: 'دخول تجريبي سريع',
      invalidCredentials: 'بريد إلكتروني أو كلمة مرور غير صحيحة',
      welcomeBackToast: 'مرحباً بعودتك!',
      signedIn: 'تم تسجيل الدخول بنجاح',
      demoAccounts: 'حسابات تجريبية',
      // Toasts
      exportComplete: 'اكتمل التصدير',
      noExport: 'لا يوجد شيء للتصدير',
      // Common
      cancel: 'إلغاء',
      save: 'حفظ',
      saveChanges: 'حفظ التغييرات',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      export: 'تصدير',
      search: 'بحث',
      results: 'نتيجة',
      pageOf: 'صفحة {page} من {total}',
      all: 'الكل',
      active: 'نشط',
      inactive: 'غير نشط',
      pending: 'قيد الانتظار',
      expired: 'منتهي',
      completed: 'مكتمل',
      failed: 'فشل',
      noData: 'لا توجد بيانات',
      confirm: 'تأكيد',
      loading: 'جارٍ التحميل',
      failed: 'تعذر تحميل الصفحة.',
      reload: 'إعادة تحميل',
      // Dashboard
      dashboardWelcome: 'مرحباً بعودتك! إليك ما يحدث في صالتك الرياضية اليوم.',
      checkInMember: 'تسجيل حضور عضو',
      viewMembers: 'عرض الأعضاء',
      totalMembers: 'إجمالي الأعضاء',
      activeMembers: 'نشط',
      todaysCheckins: 'حضور اليوم',
      classesToday: 'حصص اليوم',
      revenueToday: 'إيرادات اليوم',
      revenueThisMonth: 'هذا الشهر',
      trainers: 'مدرب',
      classes: 'حصة',
      revenueLast7Days: 'الإيرادات (آخر 7 أيام)',
      attendanceLast7Days: 'الحضور (آخر 7 أيام)',
      membershipStatus: 'حالة العضوية',
      membersCount: 'أعضاء',
      inventoryAlerts: 'تنبيهات المخزون',
      itemsLowStock: 'عناصر منخفضة المخزون',
      equipmentMaintenance: 'المعدات تحتاج صيانة',
      activeClasses: 'حصص نشطة',
      recentActivity: 'النشاط الأخير',
      newMemberRegistered: 'تسجيل عضو جديد',
      membershipPaymentReceived: 'استلام دفعة عضوية',
      groupClassScheduled: 'جدولة حصة جماعية',
      inventoryRestocked: 'إعادة تعبئة المخزون',
      equipmentMaintenanceCompleted: 'اكتمل صيانة المعدات',
      newMembershipPlanCreated: 'إنشاء خطة عضوية جديدة',
      memberCheckedIn: 'تسجيل حضور عضو',
      workoutProgramUpdated: 'تحديث برنامج تمارين',
      // Members
      memberName: 'اسم العضو',
      memberEmail: 'البريد الإلكتروني',
      memberPhone: 'الهاتف',
      membershipStatus: 'حالة العضوية',
      joinDate: 'تاريخ الانضمام',
      expiryDate: 'تاريخ الانتهاء',
      branch: 'الفرع',
      addMember: 'إضافة عضو',
      editMember: 'تعديل العضو',
      deleteMember: 'حذف العضو',
      // Membership Plans
      planName: 'اسم الخطة',
      price: 'السعر',
      duration: 'المدة',
      perks: 'المميزات',
      addPlan: 'إضافة خطة',
      editPlan: 'تعديل الخطة',
      deletePlan: 'حذف الخطة',
      // Trainers
      trainerName: 'اسم المدرب',
      specialty: 'التخصص',
      experience: 'الخبرة',
      hourlyRate: 'المعدل الساعي',
      addTrainer: 'إضافة مدرب',
      editTrainer: 'تعديل المدرب',
      deleteTrainer: 'حذف المدرب',
      // Payments
      paymentAmount: 'المبلغ',
      paymentMethod: 'طريقة الدفع',
      paymentDate: 'التاريخ',
      paymentStatus: 'الحالة',
      addPayment: 'إضافة دفعة',
      editPayment: 'تعديل الدفعة',
      deletePayment: 'حذف الدفعة',
      // Classes
      className: 'اسم الحصة',
      classSchedule: 'الجدول',
      classTrainer: 'المدرب',
      classCapacity: 'السعة',
      addClass: 'إضافة حصة',
      editClass: 'تعديل الحصة',
      deleteClass: 'حذف الحصة',
      // Reports
      reportType: 'نوع التقرير',
      dateRange: 'نطاق التاريخ',
      generateReport: 'إنشاء التقرير',
      exportReport: 'تصدير التقرير',
      // Settings
      gymName: 'اسم الصالة',
      currency: 'العملة',
      timezone: 'التوقيت',
      language: 'اللغة',
      saveSettings: 'حفظ الإعدادات',
      // Roles
      superAdmin: 'مدير النظام',
      owner: 'المالك',
      branchManager: 'مدير الفرع',
      receptionist: 'الاستقبال',
      trainer: 'المدرب',
      accountant: 'المحاسب',
    },
  };

  function getLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || 'en';
      return LANGS.includes(saved) ? saved : 'en';
    } catch (e) {
      return 'en';
    }
  }

  function setLang(lang) {
    if (!LANGS.includes(lang)) lang = 'en';
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function translate(key, params) {
    const lang = getLang();
    let str = translations[lang][key];
    if (str === undefined) str = translations.en[key] !== undefined ? translations.en[key] : key;
    if (params) {
      Object.keys(params).forEach((k) => {
        str = String(str).replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      });
    }
    return str;
  }

  function t(key, params) {
    return translate(key, params);
  }

  function currentLang() {
    return getLang();
  }

  function isRTL() {
    return getLang() === 'ar';
  }

  function applyDirection() {
    const html = document.documentElement;
    if (isRTL()) {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
      document.body.classList.add('rtl');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
      document.body.classList.remove('rtl');
    }
  }

  function init() {
    applyDirection();
    // Add Cairo font for Arabic
    if (isRTL()) {
      if (!document.querySelector('link[data-font="cairo"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap';
        link.setAttribute('data-font', 'cairo');
        document.head.appendChild(link);
      }
    }
  }

  return {
    t, translate, getLang, setLang, currentLang, isRTL, applyDirection, init, LANGS,
  };
})();

window.GymProI18n = GymProI18n;
