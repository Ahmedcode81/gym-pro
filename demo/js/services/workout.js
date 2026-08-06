/* ============================================================
   GymPro - Workout Programs Service
   ============================================================ */
const WorkoutService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => GymProDB.query('workout_programs', opts));
  }
  function get(id) {
    return request(() => GymProDB.get('workout_programs', id));
  }
  function create(data) {
    return request(() => {
      const record = GymProDB.create('workout_programs', {
        ...data,
        created_by: GymProAuth.currentUser()?.id || 1,
      });
      GymProDB.create('activities', {
        action: 'Workout program created',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function update(id, data) {
    return request(() => GymProDB.update('workout_programs', id, data));
  }
  function remove(id) {
    return request(() => GymProDB.remove('workout_programs', id));
  }
  return { list, get, create, update, remove };
})();

window.WorkoutService = WorkoutService;
