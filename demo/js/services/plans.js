/* ============================================================
   GymPro - Membership Plans Service
   ============================================================ */
const PlansService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => GymProDB.query('plans', opts));
  }
  function get(id) {
    return request(() => GymProDB.get('plans', id));
  }
  function create(data) {
    return request(() => {
      const record = GymProDB.create('plans', {
        ...data,
        status: data.status || 'active',
      });
      GymProDB.create('activities', {
        action: 'New membership plan created',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function update(id, data) {
    return request(() => {
      const record = GymProDB.update('plans', id, data);
      GymProDB.create('activities', {
        action: 'Membership plan updated',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function remove(id) {
    return request(() => {
      const ok = GymProDB.remove('plans', id);
      GymProDB.create('activities', {
        action: 'Membership plan removed',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return ok;
    });
  }
  return { list, get, create, update, remove };
})();

window.PlansService = PlansService;
