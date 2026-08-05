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
      throw new Error('Invalid email or password');
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
    return ROLE_LABELS[role] || role;
  }

  function roleColor(role) {
    return ROLE_COLORS[role] || '#2563EB';
  }

  function allRoles() {
    return Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label, color: ROLE_COLORS[value] }));
  }

  return {
    currentUser, isAuthenticated, login, logout, hasPermission,
    roleLabel, roleColor, allRoles, ROLE_LABELS,
  };
})();

window.GymProAuth = GymProAuth;
