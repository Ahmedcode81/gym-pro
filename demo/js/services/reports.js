/* ============================================================
   GymPro - Reports Service
   ============================================================ */
const ReportsService = (() => {
  const { request } = window.GymProApi;

  function getRevenueReport(period = 'month') {
    return request(() => {
      const payments = GymProDB.all('payments').filter((p) => p.status === 'completed');
      const now = new Date();
      const monthly = {};
      const byMethod = {};
      payments.forEach((p) => {
        const d = new Date(p.date);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        monthly[key] = (monthly[key] || 0) + Number(p.amount || 0);
        byMethod[p.method] = (byMethod[p.method] || 0) + Number(p.amount || 0);
      });
      const sorted = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
      return {
        total: payments.reduce((s, p) => s + Number(p.amount || 0), 0),
        count: payments.length,
        monthly: sorted.map(([k, v]) => ({ month: k, revenue: v })),
        byMethod,
      };
    });
  }

  function getMembershipReport() {
    return request(() => {
      const members = GymProDB.all('members');
      const byStatus = {};
      const byPlan = {};
      members.forEach((m) => {
        byStatus[m.membership_status] = (byStatus[m.membership_status] || 0) + 1;
        const plan = GymProDB.get('plans', m.plan_id);
        const pn = plan ? plan.name : 'Unknown';
        byPlan[pn] = (byPlan[pn] || 0) + 1;
      });
      return { total: members.length, byStatus, byPlan };
    });
  }

  function getAttendanceReport() {
    return request(() => {
      const attendance = GymProDB.all('attendance');
      const byDay = {};
      attendance.forEach((a) => {
        const d = new Date(a.check_in);
        const key = d.toLocaleDateString(undefined, { weekday: 'short' });
        byDay[key] = (byDay[key] || 0) + 1;
      });
      return { total: attendance.length, byDay };
    });
  }

  function getInventoryReport() {
    return request(() => {
      const inventory = GymProDB.all('inventory');
      const byCategory = {};
      const byStatus = {};
      const totalValue = inventory.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0);
      inventory.forEach((i) => {
        byCategory[i.category] = (byCategory[i.category] || 0) + 1;
        byStatus[i.status] = (byStatus[i.status] || 0) + 1;
      });
      return { totalItems: inventory.length, totalValue, byCategory, byStatus };
    });
  }

  function getEquipmentReport() {
    return request(() => {
      const equipment = GymProDB.all('equipment');
      const byStatus = {};
      const byType = {};
      equipment.forEach((e) => {
        byStatus[e.status] = (byStatus[e.status] || 0) + 1;
        byType[e.type] = (byType[e.type] || 0) + 1;
      });
      return { total: equipment.length, byStatus, byType };
    });
  }

  return { getRevenueReport, getMembershipReport, getAttendanceReport, getInventoryReport, getEquipmentReport };
})();

window.ReportsService = ReportsService;
