/* ============================================================
   GymPro - Equipment Service
   ============================================================ */
const EquipmentService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => GymProDB.query('equipment', opts));
  }
  function get(id) {
    return request(() => GymProDB.get('equipment', id));
  }
  function create(data) {
    return request(() => {
      const record = GymProDB.create('equipment', {
        ...data,
        status: data.status || 'operational',
        condition: data.condition || 'new',
      });
      GymProDB.create('activities', {
        action: 'Equipment added',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function update(id, data) {
    return request(() => GymProDB.update('equipment', id, data));
  }
  function remove(id) {
    return request(() => GymProDB.remove('equipment', id));
  }
  function markMaintenance(id) {
    return request(() => GymProDB.update('equipment', id, { status: 'maintenance' }));
  }
  return { list, get, create, update, remove, markMaintenance };
})();

window.EquipmentService = EquipmentService;
