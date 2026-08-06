/* ============================================================
   GymPro - App Controller
   Router, sidebar navigation, auth guard, permission-based
   page loading, theme, toasts, and bottom mobile nav.
   ============================================================ */
const GymProApp = (() => {
  const { icon, toast, esc } = window.GymProUtils;
  const { t } = window.GymProI18n;

  // ---- Language switcher ----
  function renderLangSwitcher() {
    const host = document.querySelector('.topbar-right');
    if (!host) return;
    const lang = GymProI18n.currentLang();
    const other = lang === 'ar' ? 'en' : 'ar';
    const label = other === 'ar' ? 'عربي' : 'EN';
    let btn = document.getElementById('lang-switch');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'lang-switch';
      btn.className = 'icon-btn lang-switch-btn';
      btn.setAttribute('aria-label', 'Language');
      host.prepend(btn);
    }
    btn.innerHTML = `<span class="lang-label">${label}</span>`;
    btn.onclick = () => {
      const next = GymProI18n.currentLang() === 'ar' ? 'en' : 'ar';
      GymProI18n.setLang(next);
      GymProI18n.applyDirection();
      renderLangSwitcher();
      navigate();
      if (window.GymProI18n.init) GymProI18n.init();
    };
  }

  function translateLayout() {
    document.querySelectorAll('.topbar-search input').forEach((inp) => { inp.placeholder = t('searchAnything'); });
    const brand = document.querySelector('.brand-name');
    if (brand) brand.textContent = t('appName');
  }

  // ---- Route definitions ----
  // Each route: { path, title, section, icon, page: async fn, perm, nav, bottomNav }
  const routes = {
    login: { title: 'Login', page: loadLogin },
    dashboard: { title: 'Dashboard', section: 'Main', icon: 'home', perm: 'dashboard', page: loadDashboard, nav: true, bottom: true },
    members: { title: 'Members', section: 'Management', icon: 'users', perm: 'members', page: loadMembers, nav: true, bottom: true },
    'membership-plans': { title: 'Membership Plans', section: 'Management', icon: 'creditCard', perm: 'members', page: loadMembershipPlans, nav: true },
    'check-in': { title: 'Check In', section: 'Operations', icon: 'userCheck', perm: 'check-in', page: loadCheckIn, nav: true, bottom: true },
    trainers: { title: 'Trainers', section: 'Management', icon: 'dumbbell', perm: 'trainers', page: loadTrainers, nav: true },
    'workout-programs': { title: 'Workout Programs', section: 'Training', icon: 'activity', perm: 'members', page: loadWorkoutPrograms, nav: true },
    'nutrition-plans': { title: 'Nutrition Plans', section: 'Training', icon: 'apple', perm: 'members', page: loadNutritionPlans, nav: true },
    'body-measurements': { title: 'Body Measurements', section: 'Training', icon: 'ruler', perm: 'members', page: loadBodyMeasurements, nav: true },
    'group-classes': { title: 'Group Classes', section: 'Training', icon: 'users', perm: 'trainers', page: loadGroupClasses, nav: true },
    payments: { title: 'Payments', section: 'Finance', icon: 'creditCard', perm: 'payments', page: loadPayments, nav: true, bottom: true },
    pos: { title: 'Point of Sale', section: 'Finance', icon: 'shoppingCart', perm: 'pos', page: loadPos, nav: true },
    inventory: { title: 'Inventory', section: 'Operations', icon: 'package', perm: 'inventory', page: loadInventory, nav: true },
    equipment: { title: 'Equipment', section: 'Operations', icon: 'dumbbells', perm: 'members', page: loadEquipment, nav: true },
    reports: { title: 'Reports', section: 'Analytics', icon: 'barChart', perm: 'reports', page: loadReports, nav: true },
    users: { title: 'Users', section: 'System', icon: 'shield', perm: 'members', page: loadUsers, nav: true },
    branches: { title: 'Branches', section: 'System', icon: 'building', perm: 'members', page: loadBranches, nav: true },
    settings: { title: 'Settings', section: 'System', icon: 'settings', perm: 'members', page: loadSettings, nav: true },
  };

  // Map path -> data
  const routeEntries = Object.entries(routes);

  function currentRoute() {
    const hash = location.hash.replace(/^#\/?/, '');
    return hash || 'dashboard';
  }

  // Resolve route, fallback to dashboard
  function resolveRoute(path) {
    return routes[path] || routes.dashboard;
  }

  // ---- Navigation guard ----
  function canAccess(route) {
    const user = GymProAuth.currentUser();
    if (!user) return false;
    if (route.perm === undefined) return true;
    return GymProAuth.hasPermission(route.perm);
  }

  // ---- Sidebar navigation build ----
  function buildSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const user = GymProAuth.currentUser();
    if (!user) return;

    // Group routes by section
    const sections = {};
    routeEntries.forEach(([key, r]) => {
      if (!r.nav) return;
      if (!canAccess(r)) return;
      if (!sections[r.section]) sections[r.section] = [];
      sections[r.section].push({ key, ...r });
    });

nav.innerHTML = Object.entries(sections).map(([section, links]) => `
      <div class="nav-section">
        <p class="nav-section-title">${esc(t(section))}</p>
        <div class="nav-section-links">
          ${links.map((l) => `
            <a class="nav-link" data-route="${l.key}" href="#/${l.key}">
              ${icon(l.icon)}
              <span>${t(l.title)}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function buildBottomNav() {
    const nav = document.getElementById('bottom-nav');
    const user = GymProAuth.currentUser();
    if (!user) return;
    const items = routeEntries.filter(([k, r]) => r.bottom && canAccess(r)).slice(0, 5);
nav.innerHTML = items.map(([key, r]) => `
      <a class="bottom-nav-item" data-route="${key}" href="#/${key}">
        ${icon(r.icon)}
        <span>${t(r.title)}</span>
      </a>
    `).join('');
  }

  function setActiveNav() {
    const route = currentRoute();
    document.querySelectorAll('.nav-link').forEach((el) => {
      el.classList.toggle('active', el.dataset.route === route);
    });
    document.querySelectorAll('.bottom-nav-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.route === route);
    });
  }

  // ---- Render user info ----
  function renderUser() {
    const user = GymProAuth.currentUser();
    if (!user) return;
    const initials = GymProUtils.initials(user.full_name);
    document.getElementById('sidebar-avatar').textContent = initials;
    document.getElementById('sidebar-user-name').textContent = user.full_name;
    document.getElementById('sidebar-user-role').textContent = GymProAuth.roleLabel(user.role);
    document.getElementById('header-avatar').textContent = initials;
  }

  // ---- Show app / login ----
  function showLogin() {
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
  }

  function showApp() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
  }

  // ---- Router ----
  async function navigate() {
const user = GymProAuth.currentUser();
    if (!user) {
      showLogin();
      loadLogin(document.getElementById('login-view'));
      return;
    }

showApp();
    buildSidebar();
    buildBottomNav();
    renderUser();
    renderLangSwitcher();
    translateLayout();

    const routePath = currentRoute();
    const route = resolveRoute(routePath);

    if (!canAccess(route)) {
      location.hash = '#/dashboard';
      return;
    }

    // Update page title
    document.getElementById('page-title').textContent = t(route.title);
    document.getElementById('page-section').textContent = t(route.section || 'Main');

    setActiveNav();

    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="loading-state"><div class="spinner"></div><div>${t('loading') || 'Loading'} ${t(route.title)}...</div></div>`;

    try {
      await route.page(content);
    } catch (e) {
      console.error('Page error', e);
      content.innerHTML = `<div class="empty-state"><div>Failed to load page.</div><button class="btn btn-primary" onclick="location.reload()">Reload</button></div>`;
    }
  }

  // ---- Login page loader ----
  function loadLogin(container) {
    container.innerHTML = '';
    const view = document.getElementById('login-view');
    view.innerHTML = GymProAuth.renderLogin ? GymProAuth.renderLogin() : '';
    if (GymProAuth.initLogin) GymProAuth.initLogin();
  }

  // ---- Logout ----
  function logout() {
    GymProAuth.logout();
    location.hash = '';
    navigate();
  }

// ---- Init ----
  function init() {
    if (window.GymProI18n) GymProI18n.init();
    try {
      GymProSeed.seed();
    } catch (e) {
      console.error('Seed failed (likely storage quota). Continuing with empty data.', e);
    }

    // ---- Auto demo login (from landing page "TRY DEMO") ----
    // If coming from the landing page, authenticate as the Super Admin demo
    // account and land directly on the dashboard. This does not affect the
    // normal authentication flow. The flag is consumed once.
    if (localStorage.getItem('gympro_demo_auto_login') === 'true') {
      localStorage.removeItem('gympro_demo_auto_login');
      if (!GymProAuth.currentUser()) {
        try {
          const demoUser = (GymProAuth.demoAccounts() || []).find((a) => a.role === 'super_admin');
          if (demoUser) {
            localStorage.setItem('gympro_current_user', JSON.stringify({
              id: 1,
              full_name: 'Alex Morgan',
              email: demoUser.email,
              role: demoUser.role,
              branch_id: 1,
            }));
            if (window.GymProUtils && GymProUtils.toast) {
              GymProUtils.toast({ title: 'Welcome to the demo!', description: 'Signed in as Super Admin' });
            }
          }
        } catch (e) {
          console.error('Auto demo login failed', e);
        }
      }
    }
    // Sidebar open/close
    document.getElementById('sidebar-open').addEventListener('click', () => {
      document.getElementById('sidebar').style.transform = 'translateX(0)';
      document.getElementById('sidebar-backdrop').classList.add('show');
    });
    document.getElementById('sidebar-close').addEventListener('click', () => {
      document.getElementById('sidebar').style.transform = '';
      document.getElementById('sidebar-backdrop').classList.remove('show');
    });
    document.getElementById('sidebar-backdrop').addEventListener('click', () => {
      document.getElementById('sidebar').style.transform = '';
      document.getElementById('sidebar-backdrop').classList.remove('show');
    });
    // Header avatar -> logout
    document.getElementById('header-avatar').addEventListener('click', logout);

    // Handle hash changes
    window.addEventListener('hashchange', navigate);

    // First load
    navigate();
  }

  return { init, navigate, logout, routes };
})();

window.GymProApp = GymProApp;

// Boot when DOM ready
document.addEventListener('DOMContentLoaded', () => GymProApp.init());
