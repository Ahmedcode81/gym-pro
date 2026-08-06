/* ============================================================
   GymPro - Group Classes Service
   ============================================================ */
const ClassesService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => GymProDB.query('classes', opts));
  }
  function get(id) {
    return request(() => GymProDB.get('classes', id));
  }
  function create(data) {
    return request(() => {
      const trainers = GymProDB.all('trainers');
      const trainer = trainers.find((t) => t.id === Number(data.trainer_id));
      const record = GymProDB.create('classes', {
        ...data,
        status: data.status || 'active',
        trainer_name: trainer ? trainer.full_name : (data.trainer_name || ''),
        enrolled: data.enrolled || 0,
      });
      GymProDB.create('activities', {
        action: 'Group class scheduled',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function update(id, data) {
    return request(() => {
      const trainers = GymProDB.all('trainers');
      const trainer = trainers.find((t) => t.id === Number(data.trainer_id));
      const record = GymProDB.update('classes', id, {
        ...data,
        trainer_name: trainer ? trainer.full_name : undefined,
      });
      return record;
    });
  }
  function remove(id) {
    return request(() => GymProDB.remove('classes', id));
  }
  return { list, get, create, update, remove };
})();

window.ClassesService = ClassesService;
