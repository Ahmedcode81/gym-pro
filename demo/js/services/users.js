/* ============================================================
   GymPro - Users Service (User Management)
   ============================================================ */
const UsersService = (() => {
  const { request, fail } = window.GymProApi;

  function list(opts = {}) {
    return request(() => {
      const result = GymProDB.query('users', opts);
      // strip passwords for display
      return { items: result.items.map((u) => ({ ...u, password: undefined })), total: result.total };
    });
  }
  function get(id) {
    return request(() => {
      const u = GymProDB.get('users', id);
      return u ? { ...u, password: undefined } : null;
    });
  }
  function create(data) {
    return request(() => {
      const existing = GymProDB.all('users').find((u) => u.email.toLowerCase() === String(data.email).toLowerCase());
      if (existing) fail('A user with this email already exists');
      const record = GymProDB.create('users', {
        ...data,
        password: data.password || 'pass123',
        status: data.status || 'active',
        created_at: new Date().toISOString().slice(0, 10),
      });
      GymProDB.create('activities', {
        action: 'New user account created',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      const { password, ...safe } = record;
      return safe;
    });
  }
  function update(id, data) {
    return request(() => {
      const patch = { ...data };
      if (!patch.password) delete patch.password;
      const record = GymProDB.update('users', id, patch);
      return record;
    });
  }
  function remove(id) {
    return request(() => {
      const me = GymProAuth.currentUser();
      if (me && String(me.id) === String(id)) fail('You cannot delete your own account');
      return GymProDB.remove('users', id);
    });
  }
  return { list, get, create, update, remove };
})();

window.UsersService = UsersService;
