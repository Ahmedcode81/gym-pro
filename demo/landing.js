/* ============================================================
   GymPro Landing Page - Bilingual (EN/AR) Language Switching
   ============================================================ */
(function () {
  // Supported languages
  const LANGS = ['en', 'ar'];
  const STORAGE_KEY = 'gympro_landing_lang';

  // Translation dictionary
  const translations = {
    en: {
      navFeatures: 'Features',
      navDemo: 'Live Demo',
      navDeveloper: 'Developer',
      tryDemo: 'TRY DEMO',
      heroBadge: 'All-in-one Gym Management Platform',
      heroTitle1: 'Run your gym like a',
      heroTitle2: 'pro',
      heroTitle3: 'with GymPro',
      heroDesc: 'GymPro is a professional SaaS platform that helps gym owners and managers handle members, subscriptions, trainers, check-ins, payments, and analytics — all in one modern dashboard.',
      exploreFeatures: 'Explore Features',
      statMembers: 'Members',
      statFeatures: 'Features',
      statRoles: 'User Roles',
      statData: 'Fake Data',
      mockRevenue: 'Monthly Revenue',
      mockMembers: 'Active Members',
      mockTrainers: 'Trainers',
      mockRenewal: 'Renewal Rate',
      featuresTitle: 'Everything your gym needs',
      featuresSub: 'A complete suite of tools to manage every aspect of your fitness business.',
      featOverviewTitle: 'Gym Management Overview',
      featOverviewDesc: 'Get a real-time overview of your entire facility with key metrics, occupancy, and operational health at a glance.',
      featMembersTitle: 'Member Management',
      featMembersDesc: 'Complete CRM for members with profiles, status tracking, search, filters, and import/export capabilities.',
      featSubsTitle: 'Subscription Management',
      featSubsDesc: 'Unlimited membership plans with flexible pricing, durations, freeze days, and visit limits.',
      featTrainersTitle: 'Trainers Management',
      featTrainersDesc: 'Manage trainer profiles, schedules, specializations, certifications, and member assignments.',
      featAttendanceTitle: 'Attendance Tracking',
      featAttendanceDesc: 'QR, barcode, RFID, and manual check-in with visit history and real-time tracking.',
      featPaymentsTitle: 'Payments & Billing',
      featPaymentsDesc: 'Multiple payment methods, invoices, partial payments, refunds, discounts, and taxes.',
      featReportsTitle: 'Reports & Analytics',
      featReportsDesc: 'Revenue, membership, attendance, sales, inventory, and trainer reports with PDF/Excel export.',
      featRolesTitle: 'User Roles & Permissions',
      featRolesDesc: 'Role-based access control with Super Admin, Owner, Manager, Receptionist, Trainer, and Accountant roles.',
      featDashboardTitle: 'Modern Dashboard',
      featDashboardDesc: 'A beautiful, responsive dashboard with charts, KPIs, quick actions, and live activity feeds.',
      demoTitle: 'Explore the live demo',
      demoDesc: 'Click TRY DEMO to instantly enter a fully-functional version of GymPro populated with realistic fake data. No registration required.',
      demoMembers: '500+ Fake Members',
      demoTrainers: '30 Fake Trainers',
      demoPlans: '10 Membership Plans',
      demoPayments: '200+ Fake Payments',
      demoAttendance: 'Attendance Records',
      demoReports: 'Reports & Analytics',
      demoAccounts: 'Demo Accounts',
      roleSuperAdmin: 'Super Admin',
      roleOwner: 'Owner',
      roleManager: 'Manager',
      roleReceptionist: 'Receptionist',
      roleTrainer: 'Trainer',
      roleAccountant: 'Accountant',
      demoNote: '100% fake data · No registration required',
      ctaTitle: 'Ready to see GymPro in action?',
      ctaDesc: 'Jump straight into the live demo environment and explore every feature with realistic data.',
      devRole: 'Full-Stack Developer · Creator of GymPro',
      devGithub: 'View on GitHub',
      devWhatsapp: 'WhatsApp',
      devEmail: 'Email',
      devQr: 'Scan to call',
      footerCopy: '© 2025 GymPro · Developer: AHMED ELHASSAN',
      footerTag: 'Built with care for gym owners, trainers, and fitness enthusiasts.',
      langLabel: 'العربية',
    },
    ar: {
      navFeatures: 'المميزات',
      navDemo: 'تجربة مباشرة',
      navDeveloper: 'المطور',
      tryDemo: 'جرّب النسخة التجريبية',
      heroBadge: 'منصة متكاملة لإدارة الصالات الرياضية',
      heroTitle1: 'أدر صالتك الرياضية باحترافية مع',
      heroTitle2: '',
      heroTitle3: '',
      heroDesc: 'GymPro هي منصة احترافية (SaaS) تساعد أصحاب ومديري الصالات الرياضية في إدارة الأعضاء والاشتراكات والمدربين وتسجيل الحضور والمدفوعات والتحليلات — كل ذلك في لوحة تحكم واحدة حديثة.',
      exploreFeatures: 'استكشف المميزات',
      statMembers: 'عضو',
      statFeatures: 'ميزة',
      statRoles: 'دور مستخدم',
      statData: 'بيانات تجريبية',
      mockRevenue: 'الإيراد الشهري',
      mockMembers: 'أعضاء نشطون',
      mockTrainers: 'مدرب',
      mockRenewal: 'معدل التجديد',
      featuresTitle: 'كل ما تحتاجه صالتك الرياضية',
      featuresSub: 'مجموعة أدوات شاملة لإدارة كل جوانب عملك الرياضي.',
      featOverviewTitle: 'نظرة عامة على إدارة الصالة',
      featOverviewDesc: 'احصل على نظرة شاملة وفورية لمنشأتك مع مؤشرات رئيسية ومدى الإشغال وحالة التشغيل في لمحة واحدة.',
      featMembersTitle: 'إدارة الأعضاء',
      featMembersDesc: 'نظام CRM متكامل للأعضاء مع ملفات تعريف وتتبع الحالة وبحث وتصفية وإمكانية الاستيراد والتصدير.',
      featSubsTitle: 'إدارة الاشتراكات',
      featSubsDesc: 'خطط عضوية غير محدودة مع أسعار مرنة وفترات وأيام تجميد وحدود للزيارات.',
      featTrainersTitle: 'إدارة المدربين',
      featTrainersDesc: 'إدارة ملفات المدربين والجداول والتخصصات والشهادات وتوزيع الأعضاء.',
      featAttendanceTitle: 'تتبع الحضور',
      featAttendanceDesc: 'تسجيل دخول عبر QR والباركود وRFID واليدوي مع سجل الزيارات والتتبع الفوري.',
      featPaymentsTitle: 'المدفوعات والفواتير',
      featPaymentsDesc: 'طرق دفع متعددة وفواتير ودفعات جزئية واستردادات وخصومات وضرائب.',
      featReportsTitle: 'التقارير والتحليلات',
      featReportsDesc: 'تقارير الإيرادات والعضوية والحضور والمبيعات والمخزون والمدربين مع تصدير PDF/Excel.',
      featRolesTitle: 'الأدوار والصلاحيات',
      featRolesDesc: 'التحكم بالوصول حسب الدور: مدير النظام، المالك، المدير، الاستقبال، المدرب، والمحاسب.',
      featDashboardTitle: 'لوحة تحكم حديثة',
      featDashboardDesc: 'لوحة تحكم جميلة ومتجاوبة مع رسوم بيانية ومؤشرات أداء وإجراءات سريعة وخلاصة نشاط مباشر.',
      demoTitle: 'استكشف النسخة التجريبية',
      demoDesc: 'اضغط على زر التجربة للدخول فوراً إلى نسخة كاملة الوظائف من GymPro مليئة ببيانات تجريبية واقعية. لا حاجة للتسجيل.',
      demoMembers: 'أكثر من 500 عضو تجريبي',
      demoTrainers: '30 مدرب تجريبي',
      demoPlans: '10 خطط عضوية',
      demoPayments: 'أكثر من 200 دفعة تجريبية',
      demoAttendance: 'سجلات الحضور',
      demoReports: 'التقارير والتحليلات',
      demoAccounts: 'حسابات تجريبية',
      roleSuperAdmin: 'مدير النظام',
      roleOwner: 'المالك',
      roleManager: 'المدير',
      roleReceptionist: 'الاستقبال',
      roleTrainer: 'المدرب',
      roleAccountant: 'المحاسب',
      demoNote: 'بيانات تجريبية 100% · لا حاجة للتسجيل',
      ctaTitle: 'مستعد لرؤية GymPro أثناء العمل؟',
      ctaDesc: 'ادخل مباشرة إلى بيئة العرض التجريبية واستكشف كل الميزات ببيانات واقعية.',
      devRole: 'مطوّر Full-Stack · مبتكر GymPro',
      devGithub: 'عرض على GitHub',
      devWhatsapp: 'واتساب',
      devEmail: 'البريد الإلكتروني',
      devQr: 'امسح للاتصال',
      footerCopy: '© 2025 GymPro · المطور: AHMED ELHASSAN',
      footerTag: 'صُمم بعناية لأصحاب الصالات والمدربين وعشاق اللياقة.',
      langLabel: 'English',
    },
  };

  function getSavedLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch (e) {
      return 'en';
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  let currentLang = getSavedLang();
  if (!LANGS.includes(currentLang)) currentLang = 'en';

  function applyLang(lang) {
    currentLang = lang;
    const dict = translations[lang];
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // Update lang toggle label
    const langLabel = document.getElementById('lang-label');
    if (langLabel) langLabel.textContent = dict.langLabel;

    // Update document title
    document.title = lang === 'ar' ? 'GymPro - نظام إدارة الصالات الرياضية' : 'GymPro - Professional Gym Management System';

    saveLang(lang);
  }

  // Language toggle
  window.toggleLang = function () {
    const next = currentLang === 'en' ? 'ar' : 'en';
    applyLang(next);
  };

// Start demo redirect
  window.startDemo = function () {
    // Remember chosen language for the demo app
    try {
      localStorage.setItem('gympro_lang', currentLang);
      localStorage.setItem('gympro_demo_auto_login', 'true');
    } catch (e) {}
    window.location.href = 'demo/index.html#/dashboard';
  };

  // Apply on load
  document.addEventListener('DOMContentLoaded', function () {
    applyLang(currentLang);
  });

  // Expose for debugging
  window.GymProLanding = { applyLang, currentLang: () => currentLang };
})();
