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
