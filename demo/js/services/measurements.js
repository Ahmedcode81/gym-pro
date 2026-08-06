/* ============================================================
   GymPro - Body Measurements Service
   ============================================================ */
const MeasurementsService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => GymProDB.query('measurements', opts));
  }
  function get(id) {
    return request(() => GymProDB.get('measurements', id));
  }
  function create(data) {
    return request(() => {
      const members = GymProDB.all('members');
      const m = members.find((x) => x.id === Number(data.member_id));
      const record = GymProDB.create('measurements', {
        ...data,
        member_name: m ? m.full_name : (data.member_name || ''),
        date: data.date || new Date().toISOString().slice(0, 10),
      });
      GymProDB.create('activities', {
        action: 'Body measurement recorded',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function update(id, data) {
    return request(() => GymProDB.update('measurements', id, data));
  }
  function remove(id) {
    return request(() => GymProDB.remove('measurements', id));
  }
  return { list, get, create, update, remove };
})();

window.MeasurementsService = MeasurementsService;
