/* ============================================================
   METACODE Landing Page - Bilingual (EN/AR) Language Switching
   ============================================================ */
(function () {
  // Supported languages
  const LANGS = ['en', 'ar'];
  const STORAGE_KEY = 'metacode_landing_lang';

  // Translation dictionary
  const translations = {
    en: {
      // Navigation
      navServices: 'Services',
      navProducts: 'Products',
      navProcess: 'Process',
      navContact: 'Contact',
      contactBtn: 'Contact Us',
      // Hero
      heroBadge: 'Software Solutions Built for Business',
      heroTitle1: 'Software Solutions Built for',
      heroTitle2: 'Your Business',
      heroDesc: 'We build modern business software and custom digital solutions that help businesses operate smarter, automate their workflows, and grow.',
      exploreProduct: 'Explore Our Product',
      contactMetacode: 'Contact METACODE',
      // Services
      servicesTitle: 'What We Build',
      servicesDesc: 'Comprehensive software solutions designed to transform how businesses operate and grow.',
      service1: 'Business Management Systems',
      service1Desc: 'Complete management software to streamline operations and increase efficiency.',
      service2: 'Management & Administration Software',
      service2Desc: 'Administrative tools that simplify daily business tasks and workflows.',
      service3: 'E-Commerce Platforms',
      service3Desc: 'Online stores and sales platforms to reach customers and grow revenue.',
      service4: 'Booking & Reservation Systems',
      service4Desc: 'Scheduling and booking solutions for service-based businesses.',
      service5: 'Business Websites',
      service5Desc: 'Professional websites that showcase your business and attract customers.',
      service6: 'Custom Software Solutions',
      service6Desc: 'Tailored software built specifically for your unique business requirements.',
      service7: 'Business Automation',
      service7Desc: 'Automate repetitive tasks and workflows to save time and reduce errors.',
      service8: 'Custom Digital Solutions',
      service8Desc: 'End-to-end digital transformation solutions for modern businesses.',
      // Products
      productsTitle: 'Our Products',
      productsDesc: 'Professional software solutions ready to transform your business operations.',
      gymproTagline: 'Complete Gym Management System',
      gymproDesc: 'A modern all-in-one gym management system designed to simplify daily operations, manage members, trainers, payments, subscriptions, inventory, and business performance.',
      feature1: 'Modern Dashboard',
      feature2: 'Responsive Design',
      feature3: 'Member Management',
      feature4: 'Trainer Management',
      feature5: 'Payments & Subscriptions',
      feature6: 'Inventory Management',
      feature7: 'Reports & Analytics',
      feature8: 'Role-based Access',
      liveDemo: 'Live Demo',
      requestGympro: 'Request GymPro',
      // Why METACODE
      whyTitle: 'Why Choose METACODE?',
      whyDesc: 'We build software that delivers real business value and lasting impact.',
      why1: 'Modern Technology',
      why1Desc: 'We build solutions using modern and reliable technologies.',
      why2: 'Business-Focused',
      why2Desc: 'Our systems are designed around real business workflows.',
      why3: 'Customizable',
      why3Desc: 'Solutions can be adapted to each business\'s requirements.',
      why4: 'Scalable',
      why4Desc: 'Our software is designed to grow with your business.',
      why5: 'Professional UI/UX',
      why5Desc: 'Clean, modern, responsive interfaces across devices.',
      why6: 'Support',
      why6Desc: 'Provide ongoing improvements, updates, and technical support.',
      // Process
      processTitle: 'How We Work',
      processDesc: 'A simple, transparent process from concept to deployment.',
      step1: 'Tell Us What You Need',
      step1Desc: 'Tell us about your business and requirements.',
      step2: 'We Analyze',
      step2Desc: 'We understand your workflow and identify the right solution.',
      step3: 'Explore the Solution',
      step3Desc: 'Get a demo and see how the system works.',
      step4: 'Customize',
      step4Desc: 'We adapt the solution to your business when needed.',
      step5: 'Launch',
      step5Desc: 'Deploy the solution and start using it.',
      // Demo
      demoTitle: 'See It in Action',
      demoDesc: 'Explore GymPro through our interactive demo and experience the system before making a decision.',
      tryGymproDemo: 'Try GymPro Demo',
      demoCardTitle: 'Try the Demo',
      demoCardDesc: 'No registration required. Explore the full system with realistic demo data.',
      demoNote: '100% free demo · No signup needed',
      // CTA
      ctaTitle: 'Ready to Build a Better Business?',
      ctaDesc: 'Whether you need a ready-made business system or a custom software solution, METACODE can help turn your requirements into a practical digital solution.',
      startProject: 'Start a Project',
      contactMetacodeBtn: 'Contact METACODE',
      // Contact
      contactTitle: 'Contact METACODE',
      contactDesc: 'Get in touch to discuss your project or request a custom solution.',
      companyRole: 'Software Solutions Built for Business',
      devGithub: 'View on GitHub',
      devEmail: 'Email',
      devWhatsapp: 'WhatsApp',
      // Footer
      footerTag: 'Software Solutions Built for Business',
      footerHome: 'Home',
      footerServices: 'Services',
      footerProducts: 'Products',
      footerContact: 'Contact',
      footerCopy: '© 2025 METACODE · Developer: AHMED ELHASSAN',
      langLabel: 'العربية',
    },
    ar: {
      // Navigation
      navServices: 'الخدمات',
      navProducts: 'المنتجات',
      navProcess: 'العملية',
      navContact: 'اتصل بنا',
      contactBtn: 'اتصل بنا',
      // Hero
      heroBadge: 'حلول برمجية مبنية للأعمال',
      heroTitle1: 'حلول برمجية مبنية لـ',
      heroTitle2: 'عملك',
      heroDesc: 'نحن نبني حلول برمجية حديثة وحلول رقمية مخصصة تساعد الشركات على العمل بذكاء، وأتمتة سير العمل، والنمو.',
      exploreProduct: 'استكشف منتجنا',
      contactMetacode: 'اتصل بـ METACODE',
      // Services
      servicesTitle: 'ما نبنيه',
      servicesDesc: 'حلول برمجية شاملة مصممة لتحويل طريقة عمل الشركات ونموها.',
      service1: 'أنظمة إدارة الأعمال',
      service1Desc: 'برامج إدارة كاملة لتبسيط العمليات وزيادة الكفاءة.',
      service2: 'برامج الإدارة والإدارة',
      service2Desc: 'أدوات إدارية تبسط المهام اليومية وسير العمل.',
      service3: 'منصات التجارة الإلكترونية',
      service3Desc: 'متاجر ومبيعات عبر الإنترنت للوصول للعملاء وزيادة الإيرادات.',
      service4: 'أنظمة الحجز والمواعيد',
      service4Desc: 'حلول الجدولة والحجز للشركات الخدمية.',
      service5: 'مواقع الأعمال',
      service5Desc: 'مواقع احترافية تعرض عملك وتجذب العملاء.',
      service6: 'حلول برمجية مخصصة',
      service6Desc: 'برامج مخصصة مصممة خصيصاً لمتطلبات عملك الفريدة.',
      service7: 'أتمتة الأعمال',
      service7Desc: 'أتمتة المهام المتكررة وسير العمل لتوفير الوقت وتقليل الأخطاء.',
      service8: 'حلول رقمية مخصصة',
      service8Desc: 'حلول التحول الرقمي الشاملة للشركات الحديثة.',
      // Products
      productsTitle: 'منتجاتنا',
      productsDesc: 'حلول برمجية احترافية جاهزة لتحويل عمليات عملك.',
      gymproTagline: 'نظام إدارة الصالات الشامل',
      gymproDesc: 'نظام إدارة صالات حديث شامل مصمم لتبسيط العمليات اليومية، وإدارة الأعضاء والمدربين والمدفوعات والاشتراكات والمخزون وأداء الأعمال.',
      feature1: 'لوحة تحكم حديثة',
      feature2: 'تصميم متجاوب',
      feature3: 'إدارة الأعضاء',
      feature4: 'إدارة المدربين',
      feature5: 'المدفوعات والاشتراكات',
      feature6: 'إدارة المخزون',
      feature7: 'التقارير والتحليلات',
      feature8: 'وصول قائم على الأدوار',
      liveDemo: 'تجربة مباشرة',
      requestGympro: 'طلب GymPro',
      // Why METACODE
      whyTitle: 'لماذا تختار METACODE؟',
      whyDesc: 'نحن نبني برمجيات توفر قيمة حقيقية للأعمال وتأثير دائم.',
      why1: 'تقنيات حديثة',
      why1Desc: 'نستخدم تقنيات حديثة وموثوقة في بناء الحلول.',
      why2: 'تركيز على الأعمال',
      why2Desc: 'تصميم أنظمتنا حول سير العمل الحقيقي للشركات.',
      why3: 'قابل للتخصيص',
      why3Desc: 'يمكن تكييف الحلول حسب متطلبات كل عمل.',
      why4: 'قابل للتوسع',
      why4Desc: 'برامجنا مصممة للنمو مع عملك.',
      why5: 'واجهة مستخدم احترافية',
      why5Desc: 'واجهات نظيفة وحديثة ومتجاوبة عبر الأجهزة.',
      why6: 'الدعم',
      why6Desc: 'نقدم تحسينات وتحديثات ودعم فني مستمر.',
      // Process
      processTitle: 'كيف نعمل',
      processDesc: 'عملية بسيطة وشفافة من المفهوم إلى النشر.',
      step1: 'أخبرنا باحتياجاتك',
      step1Desc: 'أخبرنا عن عملك ومتطلباتك.',
      step2: 'نحن نحلل',
      step2Desc: 'نفهم سير العمل ونحدد الحل المناسب.',
      step3: 'استكشف الحل',
      step3Desc: 'احصل على عرض تجريبي ورؤية كيف يعمل النظام.',
      step4: 'خصص',
      step4Desc: 'نكيف الحل لعملك عند الحاجة.',
      step5: 'أطلق',
      step5Desc: 'نشر الحل وابدأ في استخدامه.',
      // Demo
      demoTitle: 'شاهده يعمل',
      demoDesc: 'استكشف GymPro من خلال العرض التفاعلي وجرب النظام قبل اتخاذ القرار.',
      tryGymproDemo: 'جرب عرض GymPro',
      demoCardTitle: 'جرب العرض',
      demoCardDesc: 'لا حاجة للتسجيل. استكشف النظام الكامل ببيانات تجريبية واقعية.',
      demoNote: 'عرض تجريبي مجاني 100% · لا حاجة للتسجيل',
      // CTA
      ctaTitle: 'مستعد لبناء عمل أفضل؟',
      ctaDesc: 'سواء كنت بحاجة إلى نظام جاهز أو حل برمجي مخصص، يمكن لـ METACODE تحويل متطلباتك إلى حل رقمي عملي.',
      startProject: 'ابدأ مشروع',
      contactMetacodeBtn: 'اتصل بـ METACODE',
      // Contact
      contactTitle: 'اتصل بـ METACODE',
      contactDesc: 'تواصل معنا لمناقشة مشروعك أو طلب حل مخصص.',
      companyRole: 'حلول برمجية مبنية للأعمال',
      devGithub: 'عرض على GitHub',
      devEmail: 'البريد الإلكتروني',
      devWhatsapp: 'واتساب',
      // Footer
      footerTag: 'حلول برمجية مبنية للأعمال',
      footerHome: 'الرئيسية',
      footerServices: 'الخدمات',
      footerProducts: 'المنتجات',
      footerContact: 'اتصل بنا',
      footerCopy: '© 2025 METACODE · المطور: AHMED ELHASSAN',
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
    document.title = lang === 'ar' ? 'METACODE - حلول برمجية مبنية للأعمال' : 'METACODE - Software Solutions Built for Business';

    saveLang(lang);
  }

  // Language toggle
  window.toggleLang = function () {
    const next = currentLang === 'en' ? 'ar' : 'en';
    applyLang(next);
  };

  // Navigation functions
  window.scrollToSection = function (id) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  window.scrollToServices = function () {
    scrollToSection('services');
  };

  window.scrollToProducts = function () {
    scrollToSection('products');
  };

  window.scrollToContact = function () {
    scrollToSection('contact');
  };

  window.openGymProDemo = function () {
    window.open('../demo/index.html#/dashboard', '_blank');
  };

  // Apply on load
  document.addEventListener('DOMContentLoaded', function () {
    applyLang(currentLang);
  });

  // Expose for debugging
  window.METACODELanding = { applyLang, currentLang: () => currentLang };
})();