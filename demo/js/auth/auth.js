/* ============================================================
   GymPro - Auth
   Fake authentication using localStorage. Roles:
   super_admin, owner, branch_manager, receptionist, trainer, accountant.
   ============================================================ */
const GymProAuth = (() => {
  const { delay, toast } = window.GymProUtils;

  const ROLE_LABELS = {
    super_admin: 'Super Admin',
    owner: 'Owner',
    branch_manager: 'Branch Manager',
    receptionist: 'Receptionist',
    trainer: 'Trainer',
    accountant: 'Accountant',
  };

  // Get translated role label
  function getRoleLabel(role) {
    if (window.GymProI18n) {
      const key = role.replace('_', '').replace(/\b\w/g, l => l.toUpperCase());
      const translationKey = key.charAt(0).toLowerCase() + key.slice(1);
      const translations = {
        superAdmin: 'superAdmin',
        owner: 'owner', 
        branchManager: 'branchManager',
        receptionist: 'receptionist',
        trainer: 'trainer',
        accountant: 'accountant'
      };
      const tKey = translations[translationKey] || translationKey;
      const translated = window.GymProI18n.t(tKey);
      if (translated !== tKey) return translated;
    }
    return ROLE_LABELS[role] || role;
  }

  const ROLE_COLORS = {
    super_admin: '#EF4444',
    owner: '#8B5CF6',
    branch_manager: '#2563EB',
    receptionist: '#06B6D4',
    trainer: '#22C55E',
    accountant: '#F59E0B',
  };

  // Permission map: role -> allowed resource prefixes
  const PERMISSIONS = {
    super_admin: ['*'],
    owner: ['*'],
    branch_manager: ['members','trainers','classes','check-in','payments','inventory','equipment','reports','dashboard','branches','attendance'],
    receptionist: ['members','check-in','payments','dashboard','attendance'],
    trainer: ['members','workout-programs','nutrition-plans','body-measurements','classes','check-in','dashboard'],
    accountant: ['payments','reports','dashboard','pos','inventory','billing'],
  };

  function currentUser() {
    try {
      return JSON.parse(localStorage.getItem('gympro_current_user'));
    } catch (e) {
      return null;
    }
  }

  function isAuthenticated() {
    return !!currentUser();
  }

  async function login(email, password) {
    await delay(600);
    const users = GymProDB.all('users');
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
    if (!user) {
      const errorMsg = window.GymProI18n ? window.GymProI18n.t('invalidCredentials') : 'Invalid email or password';
      throw new Error(errorMsg);
    }
    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id,
    };
    localStorage.setItem('gympro_current_user', JSON.stringify(safeUser));
    return safeUser;
  }

  function logout() {
    localStorage.removeItem('gympro_current_user');
  }

  function hasPermission(resource, action) {
    const user = currentUser();
    if (!user) return false;
    const perms = PERMISSIONS[user.role] || [];
    if (perms.includes('*')) return true;
    return perms.includes(resource);
  }

  function roleLabel(role) {
    return getRoleLabel(role);
  }

  function roleColor(role) {
    return ROLE_COLORS[role] || '#2563EB';
  }

  function allRoles() {
    return Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label, color: ROLE_COLORS[value] }));
  }

// ---- Login view rendering ----
  function demoAccounts() {
    const accounts = [
      { role: 'super_admin', email: 'admin@gympro.com', password: 'admin123', color: '#EF4444' },
      { role: 'owner', email: 'owner@gympro.com', password: 'owner123', color: '#8B5CF6' },
      { role: 'branch_manager', email: 'manager@gympro.com', password: 'manager123', color: '#2563EB' },
      { role: 'receptionist', email: 'receptionist@gympro.com', password: 'reception123', color: '#06B6D4' },
      { role: 'trainer', email: 'trainer@gympro.com', password: 'trainer123', color: '#22C55E' },
      { role: 'accountant', email: 'accountant@gympro.com', password: 'account123', color: '#F59E0B' },
    ];
    return accounts.map(acc => ({
      ...acc,
      label: getRoleLabel(acc.role)
    }));
  }

function renderLogin() {
    const { icon } = window.GymProUtils;
    const t = (window.GymProI18n && GymProI18n.t) ? GymProI18n.t.bind(GymProI18n) : (k) => k;
    return `
      <div class="login-wrap">
        <div class="login-box">
          <div class="login-brand">
            <div class="brand-logo">${icon('dumbbell')}</div>
            <h1>${t('appName')}</h1>
          </div>
          <div class="login-card">
            <h2>${t('welcomeBack')}</h2>
            <p class="login-sub">${t('loginSub')}</p>
            <div id="login-error" class="login-error hidden"></div>
            <form id="login-form">
              <div class="form-group">
                <label class="form-label">${t('email')}</label>
                <div class="input-with-icon">
                  ${icon('mail')}
                  <input type="email" id="login-email" class="form-control" placeholder="you@example.com" required />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">${t('password')}</label>
                <div class="input-with-icon">
                  ${icon('lock')}
                  <input type="password" id="login-password" class="form-control" placeholder="••••••••" required />
                  <button type="button" class="password-toggle" id="password-toggle">${icon('eye')}</button>
                </div>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;height:48px;margin-top:8px" id="login-submit">
                ${icon('logIn')} ${t('signIn')}
              </button>
            </form>
            <div class="demo-accounts">
              <p class="demo-accounts-title">${t('quickDemoLogin')}</p>
              <div class="demo-account-grid">
                ${demoAccounts().map((a) => `
                  <button class="demo-account" data-email="${a.email}" data-password="${a.password}">
                    <span class="role-dot" style="background:${a.color}"></span>
                    ${t(a.label)}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
          <p class="login-footer">GymPro Demo &copy; 2025</p>
        </div>
      </div>
    `;
  }

  function initLogin() {
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');
    const submitBtn = document.getElementById('login-submit');
    const toggle = document.getElementById('password-toggle');
    const passInput = document.getElementById('login-password');

    // Password toggle
    if (toggle) {
      toggle.addEventListener('click', () => {
        const type = passInput.type === 'password' ? 'text' : 'password';
        passInput.type = type;
        toggle.innerHTML = window.GymProUtils.icon(type === 'password' ? 'eye' : 'eyeOff');
      });
    }

    // Demo quick login buttons
    document.querySelectorAll('.demo-account').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const email = btn.dataset.email;
        const password = btn.dataset.password;
        // Prefill
        document.getElementById('login-email').value = email;
        document.getElementById('login-password').value = password;
        await doLogin(email, password, errorEl, submitBtn);
      });
    });

    // Form submit
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await doLogin(email, password, errorEl, submitBtn);
      });
    }
  }

  async function doLogin(email, password, errorEl, submitBtn) {
    if (errorEl) errorEl.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = true;
    try {
      await login(email, password);
      window.GymProUtils.toast({ title: 'Welcome back!', description: 'Signed in successfully' });
      location.hash = '#/dashboard';
      if (window.GymProApp && GymProApp.navigate) GymProApp.navigate();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || 'Invalid credentials';
        errorEl.classList.remove('hidden');
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  return {
    currentUser, isAuthenticated, login, logout, hasPermission,
    roleLabel, roleColor, allRoles, ROLE_LABELS, renderLogin, initLogin, demoAccounts,
  };
})();

window.GymProAuth = GymProAuth;
