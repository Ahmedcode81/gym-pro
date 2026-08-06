/* ============================================================
   GymPro - Attendance Service
   ============================================================ */
const AttendanceService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => GymProDB.query('attendance', opts));
  }
  function create(data) {
    return request(() => {
      const record = GymProDB.create('attendance', {
        ...data,
        check_in: data.check_in || new Date().toISOString(),
        status: data.status || 'active',
      });
      GymProDB.create('activities', {
        action: 'Member checked in',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function checkOut(id) {
    return request(() => {
      const record = GymProDB.update('attendance', id, {
        check_out: new Date().toISOString(),
        status: 'completed',
      });
      return record;
    });
  }
  function update(id, data) {
    return request(() => GymProDB.update('attendance', id, data));
  }
  function remove(id) {
    return request(() => GymProDB.remove('attendance', id));
  }
  function todayCount() {
    return request(() => {
      const today = new Date().toDateString();
      return GymProDB.all('attendance').filter((a) => new Date(a.check_in).toDateString() === today).length;
    });
  }
  function activeCount() {
    return request(() => GymProDB.all('attendance').filter((a) => a.status === 'active').length);
  }
  return { list, create, checkOut, update, remove, todayCount, activeCount };
})();

window.AttendanceService = AttendanceService;
