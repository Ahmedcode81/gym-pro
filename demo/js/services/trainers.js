/* ============================================================
   GymPro - Trainers Service
   ============================================================ */
const TrainersService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => GymProDB.query('trainers', opts));
  }
  function get(id) {
    return request(() => GymProDB.get('trainers', id));
  }
  function create(data) {
    return request(() => {
      const record = GymProDB.create('trainers', {
        ...data,
        hire_date: data.hire_date || new Date().toISOString().slice(0, 10),
        status: data.status || 'active',
      });
      GymProDB.create('activities', {
        action: 'New trainer added',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function update(id, data) {
    return request(() => {
      const record = GymProDB.update('trainers', id, data);
      GymProDB.create('activities', {
        action: 'Trainer updated',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function remove(id) {
    return request(() => {
      const ok = GymProDB.remove('trainers', id);
      GymProDB.create('activities', {
        action: 'Trainer removed',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return ok;
    });
  }
  return { list, get, create, update, remove };
})();

window.TrainersService = TrainersService;
