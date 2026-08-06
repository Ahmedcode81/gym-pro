/* ============================================================
   GymPro - Branches Service
   ============================================================ */
const BranchesService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => GymProDB.query('branches', opts));
  }
  function get(id) {
    return request(() => GymProDB.get('branches', id));
  }
  function create(data) {
    return request(() => {
      const record = GymProDB.create('branches', {
        ...data,
        status: data.status || 'active',
      });
      GymProDB.create('activities', {
        action: 'New branch added',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function update(id, data) {
    return request(() => GymProDB.update('branches', id, data));
  }
  function remove(id) {
    return request(() => GymProDB.remove('branches', id));
  }
  return { list, get, create, update, remove };
})();

window.BranchesService = BranchesService;
