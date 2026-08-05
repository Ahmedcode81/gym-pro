/* ============================================================
   GymPro - App Controller
   Router, sidebar navigation, auth guard, permission-based
   page loading, theme, toasts, and bottom mobile nav.
   ============================================================ */
const GymProApp = (() => {
  const { icon, toast, esc } = window.GymProUtils;

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
        <p class="nav-section-title">${esc(section)}</p>
        <div class="nav-section-links">
          ${links.map((l) => `
            <a class="nav-link" data-route="${l.key}" href="#/${l.key}">
              ${icon(l.icon)}
              <span>${l.title}</span>
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
        <span>${r.title}</span>
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

    const routePath = currentRoute();
    const route = resolveRoute(routePath);

    if (!canAccess(route)) {
      location.hash = '#/dashboard';
      return;
    }

    // Update page title
    document.getElementById('page-title').textContent = route.title;
    document.getElementById('page-section').textContent = route.section || 'Main';

    setActiveNav();

    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="loading-state"><div class="spinner"></div><div>Loading ${route.title}...</div></div>`;

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
    try {
      GymProSeed.seed();
    } catch (e) {
      console.error('Seed failed (likely storage quota). Continuing with empty data.', e);
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
