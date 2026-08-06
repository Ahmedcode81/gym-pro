/* ============================================================
   GymPro - Reports Page
   Revenue, membership, attendance, inventory, equipment reports
   with charts.
   ============================================================ */
const ReportsPage = (() => {
  const { icon, esc, money, num } = window.GymProUtils;

  async function render(container) {
    const [revRes, memRes, attRes, invRes, eqRes] = await Promise.all([
      ReportsService.getRevenueReport(),
      ReportsService.getMembershipReport(),
      ReportsService.getAttendanceReport(),
      ReportsService.getInventoryReport(),
      ReportsService.getEquipmentReport(),
    ]);

    const revenue = revRes.data;
    const membership = memRes.data;
    const attendance = attRes.data;
    const inventory = invRes.data;
    const equipment = eqRes.data;

    // Revenue monthly bar chart
    const maxRev = Math.max(...revenue.monthly.map((m) => m.revenue), 1);
    const revBars = revenue.monthly.slice(-6).map((m, i) => {
      const h = Math.max(4, Math.round((m.revenue / maxRev) * 200));
      return `<div class="bar-col">
        <div class="bar-value" style="font-size:0.65rem">${money0(m.revenue)}</div>
        <div class="bar-track"><div class="bar-fill" style="height:${h}px;background:#2563eb"></div></div>
        <div class="bar-label">${esc(m.month)}</div>
      </div>`;
    }).join('');

    // Membership pie
    const msTotal = Object.values(membership.byStatus).reduce((s, v) => s + v, 0) || 1;
    const msColors = { active: '#22C55E', expired: '#EF4444', pending: '#F59E0B' };
    const msLabels = { active: 'Active', expired: 'Expired', pending: 'Pending' };
    let acc = 0;
    const msGrad = Object.entries(membership.byStatus).map(([k, v]) => {
      const start = acc / msTotal * 100;
      acc += v;
      const end = acc / msTotal * 100;
      return `${msColors[k] || '#2563eb'} ${start}% ${end}%`;
    }).join(', ');

    // Attendance by day
    const attTotal = Object.values(attendance.byDay).reduce((s, v) => s + v, 0) || 1;
    const attColors = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
    const attSegments = Object.entries(attendance.byDay).map(([d, v], i) => ({
      label: d, val: v, color: attColors[i % attColors.length],
    }));

    // Payment methods
    const methodEntries = Object.entries(revenue.byMethod).sort((a, b) => b[1] - a[1]);
    const methodTotal = methodEntries.reduce((s, m) => s + m[1], 0) || 1;

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Reports</h1>
            <p>Business analytics and insights</p>
          </div>
        </div>

        <div class="grid grid-4" style="margin-bottom:24px">
          <div class="card stat-card">
            <div class="stat-card-top">
              <div><div class="stat-value">${money(revenue.total)}</div><div class="stat-label">Total Revenue</div></div>
              <div class="stat-icon" style="background:#dcfce7;color:#16a34a">${icon('dollar')}</div>
            </div>
            <div class="trend trend-up">${icon('arrowUp')} ${num(revenue.count)} payments</div>
          </div>
          <div class="card stat-card">
            <div class="stat-card-top">
              <div><div class="stat-value">${num(membership.total)}</div><div class="stat-label">Total Members</div></div>
              <div class="stat-icon" style="background:#dbeafe;color:#2563eb">${icon('users')}</div>
            </div>
            <div class="trend trend-up">${icon('arrowUp')} ${num(membership.byStatus.active || 0)} active</div>
          </div>
          <div class="card stat-card">
            <div class="stat-card-top">
              <div><div class="stat-value">${num(attendance.total)}</div><div class="stat-label">Total Check-ins</div></div>
              <div class="stat-icon" style="background:#fef3c7;color:#d97706">${icon('userCheck')}</div>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-card-top">
              <div><div class="stat-value">${money(inventory.totalValue)}</div><div class="stat-label">Inventory Value</div></div>
              <div class="stat-icon" style="background:#ede9fe;color:#7c3aed">${icon('package')}</div>
            </div>
            <div class="trend">${num(inventory.totalItems)} items</div>
          </div>
        </div>

        <div class="grid grid-2" style="margin-bottom:24px">
          <div class="card chart-card">
            <div class="card-header"><h3>Revenue by Month</h3></div>
            <div class="card-body"><div class="bar-chart">${revBars}</div></div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Membership Status</h3></div>
            <div class="card-body">
              <div class="pie-wrap">
                <div class="pie-chart" style="background:conic-gradient(${msGrad});border-radius:50%">
                  <div class="pie-center" style="background:#fff;border-radius:50%">
                    <span class="val">${num(msTotal)}</span><span class="lbl">Members</span>
                  </div>
                </div>
                <div class="pie-legend">
                  ${Object.entries(membership.byStatus).map(([k, v]) => `
                    <div class="legend-item">
                      <span class="legend-dot" style="background:${msColors[k] || '#2563eb'}"></span>
                      ${msLabels[k] || k}
                      <span class="legend-val">${num(v)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-3" style="margin-bottom:24px">
          <div class="card">
            <div class="card-header"><h3>Attendance by Day</h3></div>
            <div class="card-body">
              <div class="pie-wrap">
                <div class="pie-chart" style="width:160px;height:160px;background:conic-gradient(${attSegments.map((s, i) => { let st = 0; for (let j = 0; j < i; j++) st += attSegments[j].val / attTotal * 100; return `${s.color} ${st}% ${st + s.val / attTotal * 100}%`; }).join(', ')});border-radius:50%">
                  <div class="pie-center" style="background:#fff;border-radius:50%"><span class="val">${num(attTotal)}</span><span class="lbl">Check-ins</span></div>
                </div>
                <div class="pie-legend">
                  ${attSegments.map((s) => `<div class="legend-item"><span class="legend-dot" style="background:${s.color}"></span>${s.label}<span class="legend-val">${num(s.val)}</span></div>`).join('')}
                </div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Payment Methods</h3></div>
            <div class="card-body">
              ${methodEntries.map(([m, v]) => {
                const pct = Math.round((v / methodTotal) * 100);
                return `<div style="margin-bottom:16px">
                  <div style="display:flex;justify-content:space-between;font-size:0.875rem;margin-bottom:4px">
                    <span>${esc(m)}</span><strong>${money(v)} (${pct}%)</strong>
                  </div>
                  <div class="progress-track"><div class="progress-bar" style="width:${pct}%;background:#2563eb"></div></div>
                </div>`;
              }).join('')}
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Inventory Status</h3></div>
            <div class="card-body">
              <div class="stat-mini" style="border-bottom:1px solid #f3f4f6">
                <div class="val" style="color:#16a34a">${num(inventory.byStatus.in_stock || 0)}</div>
                <div class="lbl">In Stock</div>
              </div>
              <div class="stat-mini" style="border-bottom:1px solid #f3f4f6">
                <div class="val" style="color:#d97706">${num(inventory.byStatus.low_stock || 0)}</div>
                <div class="lbl">Low Stock</div>
              </div>
              <div class="stat-mini">
                <div class="val" style="color:#dc2626">${num(inventory.byStatus.out_of_stock || 0)}</div>
                <div class="lbl">Out of Stock</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>Equipment Status</h3></div>
          <div class="card-body">
            <div class="stats-row">
              <div class="stat-mini"><div class="val" style="color:#16a34a">${num(equipment.byStatus.operational || 0)}</div><div class="lbl">Operational</div></div>
              <div class="stat-mini"><div class="val" style="color:#d97706">${num(equipment.byStatus.maintenance || 0)}</div><div class="lbl">In Maintenance</div></div>
              <div class="stat-mini"><div class="val" style="color:#dc2626">${num(equipment.byStatus.out_of_service || 0)}</div><div class="lbl">Out of Service</div></div>
              <div class="stat-mini"><div class="val">${num(equipment.total)}</div><div class="lbl">Total Equipment</div></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function money0(n) { return '$' + Number(n || 0).toLocaleString(); }

  return { render };
})();

window.loadReports = (container) => ReportsPage.render(container);
