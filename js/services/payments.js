/* ============================================================
   GymPro - Payments Service
   ============================================================ */
const PaymentsService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => GymProDB.query('payments', opts));
  }
  function get(id) {
    return request(() => GymProDB.get('payments', id));
  }
  function create(data) {
    return request(() => {
      const record = GymProDB.create('payments', {
        ...data,
        date: data.date || new Date().toISOString().slice(0, 10),
        reference: data.reference || 'PAY-' + (100000 + Math.floor(Math.random() * 90000)),
        status: data.status || 'completed',
      });
      GymProDB.create('activities', {
        action: 'Payment received',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      // Update member membership to active
      if (data.member_id) {
        GymProDB.update('members', data.member_id, { membership_status: 'active' });
      }
      return record;
    });
  }
  function update(id, data) {
    return request(() => {
      const record = GymProDB.update('payments', id, data);
      GymProDB.create('activities', {
        action: 'Payment updated',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function remove(id) {
    return request(() => {
      const ok = GymProDB.remove('payments', id);
      GymProDB.create('activities', {
        action: 'Payment deleted',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return ok;
    });
  }
  function revenue(periodDays) {
    return request(() => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (periodDays || 30));
      return GymProDB.all('payments')
        .filter((p) => p.status === 'completed' && new Date(p.date) >= cutoff)
        .reduce((acc, p) => acc + Number(p.amount || 0), 0);
    });
  }
  function todayRevenue() {
    return request(() => {
      const today = new Date().toISOString().slice(0, 10);
      return GymProDB.all('payments')
        .filter((p) => p.status === 'completed' && p.date === today)
        .reduce((acc, p) => acc + Number(p.amount || 0), 0);
    });
  }
  return { list, get, create, update, remove, revenue, todayRevenue };
})();

window.PaymentsService = PaymentsService;
