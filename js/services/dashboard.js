/* ============================================================
   GymPro - Dashboard Service
   Computes live stats, charts, and activities from the stores.
   ============================================================ */
const DashboardService = (() => {
  const { request } = window.GymProApi;

  function getStats() {
    return request(() => {
      const members = GymProDB.all('members');
      const payments = GymProDB.all('payments');
      const attendance = GymProDB.all('attendance');
      const classes = GymProDB.all('classes');
      const inventory = GymProDB.all('inventory');
      const equipment = GymProDB.all('equipment');
      const trainers = GymProDB.all('trainers');

      const totalMembers = members.length;
      const activeMembers = members.filter((m) => m.membership_status === 'active').length;
      const expiredMembers = members.filter((m) => m.membership_status === 'expired').length;
      const pendingMembers = members.filter((m) => m.membership_status === 'pending').length;

      const today = new Date().toISOString().slice(0, 10);
      const todayCheckins = attendance.filter((a) => new Date(a.check_in).toISOString().slice(0, 10) === today).length;

      const completedPayments = payments.filter((p) => p.status === 'completed');
      const revenueToday = completedPayments.filter((p) => p.date === today).reduce((s, p) => s + Number(p.amount || 0), 0);
      const thisMonth = today.slice(0, 7);
      const revenueThisMonth = completedPayments.filter((p) => p.date && p.date.startsWith(thisMonth)).reduce((s, p) => s + Number(p.amount || 0), 0);

      // Revenue chart (last 7 days)
      const salesChart = { labels: [], datasets: [{ data: [] }] };
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        const lbl = d.toLocaleDateString(undefined, { weekday: 'short' });
        const rev = completedPayments.filter((p) => p.date === ds).reduce((s, p) => s + Number(p.amount || 0), 0);
        salesChart.labels.push(lbl);
        salesChart.datasets[0].data.push(rev);
      }

      // Attendance chart (last 7 days)
      const attendanceChart = { labels: [], datasets: [{ data: [] }] };
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        const lbl = d.toLocaleDateString(undefined, { weekday: 'short' });
        const cnt = attendance.filter((a) => new Date(a.check_in).toISOString().slice(0, 10) === ds).length;
        attendanceChart.labels.push(lbl);
        attendanceChart.datasets[0].data.push(cnt);
      }

      // Membership distribution for pie
      const membershipStats = { active: activeMembers, expired: expiredMembers, pending: pendingMembers };

      // Low stock & maintenance
      const lowStock = inventory.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock').length;
      const maintenance = equipment.filter((e) => e.status === 'maintenance' || e.status === 'out_of_service').length;
      const upcomingClasses = classes.filter((c) => c.status === 'active').length;

      const recentActivities = (GymProDB.all('activities') || [])
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 8);

      return {
        total_members: totalMembers,
        active_members: activeMembers,
        expired_memberships: expiredMembers,
        pending_memberships: pendingMembers,
        today_checkins: todayCheckins,
        revenue_today: revenueToday,
        revenue_this_month: revenueThisMonth,
        total_trainers: trainers.length,
        total_classes: classes.length,
        total_payments: completedPayments.length,
        low_stock: lowStock,
        equipment_maintenance: maintenance,
        upcoming_classes: upcomingClasses,
        sales_chart: salesChart,
        attendance_chart: attendanceChart,
        membership_statistics: membershipStats,
        recent_activities: recentActivities,
      };
    });
  }

  return { getStats };
})();

window.DashboardService = DashboardService;
