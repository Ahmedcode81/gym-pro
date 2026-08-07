/* ============================================================
   GymPro - Dashboard Page
   Live stats, charts, attendance summary, revenue, inventory alerts,
   recent activity, membership summary.
   ============================================================ */
const DashboardPage = (() => {
  const { icon, money, money0, num, datetime, esc } = window.GymProUtils;
  const { t } = window.GymProI18n;

  async function render(container) {
    try {
      const res = await DashboardService.getStats();
      if (res.error) {
        console.error('Dashboard error:', res.error);
        container.innerHTML = `<div class="empty-state">Failed to load dashboard: ${res.error}</div>`;
        return;
      }
      const s = res.data;
      console.log('Dashboard data:', s);
    const colors = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

    // Revenue bar chart
    const maxRev = Math.max(...s.sales_chart.datasets[0].data, 1);
    const revBars = s.sales_chart.labels.map((l, i) => {
      const v = s.sales_chart.datasets[0].data[i];
      const h = Math.max(4, Math.round((v / maxRev) * 220));
      return `<div class="bar-col">
        <div class="bar-value">${money0(v)}</div>
        <div class="bar-track"><div class="bar-fill" style="height:${h}px;background:${colors[i % colors.length]}"></div></div>
        <div class="bar-label">${l}</div>
      </div>`;
    }).join('');

    // Attendance chart
    const maxAtt = Math.max(...s.attendance_chart.datasets[0].data, 1);
    const attBars = s.attendance_chart.labels.map((l, i) => {
      const v = s.attendance_chart.datasets[0].data[i];
      const h = Math.max(4, Math.round((v / maxAtt) * 220));
      return `<div class="bar-col">
        <div class="bar-value">${num(v)}</div>
        <div class="bar-track"><div class="bar-fill" style="height:${h}px;background:${colors[(i + 2) % colors.length]}"></div></div>
        <div class="bar-label">${l}</div>
      </div>`;
    }).join('');

    // Membership pie
    const ms = s.membership_statistics;
    const totalMs = ms.active + ms.expired + ms.pending || 1;
    const pieSegments = [
      { label: t('active'), val: ms.active, color: '#22C55E' },
      { label: t('expired'), val: ms.expired, color: '#EF4444' },
      { label: t('pending'), val: ms.pending, color: '#F59E0B' },
    ];
    let acc = 0;
    const pieGradients = pieSegments.map((seg) => {
      const start = acc / totalMs * 100;
      acc += seg.val;
      const end = acc / totalMs * 100;
      return `${seg.color} ${start}% ${end}%`;
    }).join(', ');

    // Activities
    const activitiesHtml = s.recent_activities.map((a) => `
      <div class="activity-item">
        <span class="activity-dot"></span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:500;font-size:0.875rem;color:#1e293b">${esc(a.action)}</div>
          <div style="font-size:0.75rem;color:#64748b">${esc(a.user)} &middot; ${datetime(a.timestamp)}</div>
        </div>
      </div>
    `).join('') || `<div class="empty-state">${t('noData')}</div>`;

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>${t('Dashboard')}</h1>
            <p>${t('dashboardWelcome')}</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-primary" data-nav="check-in">${icon('userCheck')} ${t('checkInMember')}</button>
            <button class="btn btn-outline" data-nav="members">${icon('users')} ${t('viewMembers')}</button>
          </div>
        </div>

        <!-- Stat cards -->
        <div class="grid grid-4" style="margin-bottom:24px">
          <div class="card stat-card">
            <div class="stat-card-top">
              <div>
                <div class="stat-value">${num(s.total_members)}</div>
                <div class="stat-label">${t('totalMembers')}</div>
              </div>
              <div class="stat-icon" style="background:#dbeafe;color:#2563eb">${icon('users')}</div>
            </div>
            <div class="trend trend-up">${icon('arrowUp')} ${num(s.active_members)} ${t('activeMembers')}</div>
          </div>
          <div class="card stat-card">
            <div class="stat-card-top">
              <div>
                <div class="stat-value">${num(s.today_checkins)}</div>
                <div class="stat-label">${t('todaysCheckins')}</div>
              </div>
              <div class="stat-icon" style="background:#dcfce7;color:#16a34a">${icon('userCheck')}</div>
            </div>
            <div class="trend trend-up">${icon('arrowUp')} ${num(s.upcoming_classes)} ${t('classesToday')}</div>
          </div>
          <div class="card stat-card">
            <div class="stat-card-top">
              <div>
                <div class="stat-value">${money(s.revenue_today)}</div>
                <div class="stat-label">${t('revenueToday')}</div>
              </div>
              <div class="stat-icon" style="background:#fef3c7;color:#d97706">${icon('dollar')}</div>
            </div>
            <div class="trend trend-up">${icon('arrowUp')} ${money(s.revenue_this_month)} ${t('revenueThisMonth')}</div>
          </div>
          <div class="card stat-card">
            <div class="stat-card-top">
              <div>
                <div class="stat-value">${num(s.total_trainers)}</div>
                <div class="stat-label">${t('trainers')}</div>
              </div>
              <div class="stat-icon" style="background:#ede9fe;color:#7c3aed">${icon('dumbbell')}</div>
            </div>
            <div class="trend">${icon('users')} ${num(s.total_classes)} ${t('classes')}</div>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-2" style="margin-bottom:24px">
          <div class="card chart-card">
            <div class="card-header"><h3>${t('revenueLast7Days')}</h3></div>
            <div class="card-body"><div class="bar-chart">${revBars}</div></div>
          </div>
          <div class="card chart-card">
            <div class="card-header"><h3>${t('attendanceLast7Days')}</h3></div>
            <div class="card-body"><div class="bar-chart">${attBars}</div></div>
          </div>
        </div>

        <div class="grid grid-3" style="margin-bottom:24px">
          <div class="card">
            <div class="card-header"><h3>${t('membershipStatus')}</h3></div>
            <div class="card-body">
              <div class="pie-wrap">
                <div class="pie-chart" style="background:conic-gradient(${pieGradients});border-radius:50%">
                  <div class="pie-center" style="background:#fff;border-radius:50%">
                    <span class="val">${num(totalMs)}</span>
                    <span class="lbl">${t('membersCount')}</span>
                  </div>
                </div>
                <div class="pie-legend">
                  ${pieSegments.map((seg) => `
                    <div class="legend-item">
                      <span class="legend-dot" style="background:${seg.color}"></span>
                      ${seg.label}
                      <span class="legend-val">${num(seg.val)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>${t('inventoryAlerts')}</h3></div>
            <div class="card-body">
              <div class="stat-mini" style="border-bottom:1px solid #f3f4f6"><div class="val" style="color:#d97706">${num(s.low_stock)}</div><div class="lbl">${t('itemsLowStock')}</div></div>
              <div class="stat-mini" style="border-bottom:1px solid #f3f4f6"><div class="val" style="color:#dc2626">${num(s.equipment_maintenance)}</div><div class="lbl">${t('equipmentMaintenance')}</div></div>
              <div class="stat-mini"><div class="val" style="color:#2563eb">${num(s.upcoming_classes)}</div><div class="lbl">${t('activeClasses')}</div></div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>${t('recentActivity')}</h3></div>
            <div class="card-body" style="max-height:320px;overflow-y:auto">${activitiesHtml}</div>
          </div>
        </div>
      </div>
    `;

    // Nav buttons
    container.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', () => { location.hash = '#/' + btn.dataset.nav; });
    });
    } catch (err) {
      console.error('Dashboard render error:', err);
      container.innerHTML = `<div class="empty-state">Error rendering dashboard: ${err.message}</div>`;
    }
  }

  return { render };
})();

window.loadDashboard = (container) => DashboardPage.render(container);
