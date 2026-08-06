/* ============================================================
   GymPro - Members Service
   ============================================================ */
const MembersService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => {
      const result = GymProDB.query('members', opts);
      return result;
    });
  }

  function get(id) {
    return request(() => GymProDB.get('members', id));
  }

  function create(data) {
    return request(() => {
      const record = GymProDB.create('members', {
        ...data,
        join_date: data.join_date || new Date().toISOString().slice(0, 10),
        membership_status: data.membership_status || 'active',
      });
      GymProDB.create('activities', {
        action: 'New member registered',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }

  function update(id, data) {
    return request(() => {
      const record = GymProDB.update('members', id, data);
      GymProDB.create('activities', {
        action: 'Member profile updated',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }

  function remove(id) {
    return request(() => {
      const ok = GymProDB.remove('members', id);
      GymProDB.create('activities', {
        action: 'Member removed',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return ok;
    });
  }

  function count(opts = {}) {
    return request(() => GymProDB.count('members'));
  }

  return { list, get, create, update, remove, count };
})();

window.MembersService = MembersService;
