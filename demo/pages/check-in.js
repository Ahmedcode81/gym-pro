/* ============================================================
   GymPro - Check In Page
   Quick member check-in, active sessions, today's log.
   ============================================================ */
const CheckInPage = (() => {
  const { icon, esc, initials, avatarColor, toast, date, time, confirmDialog } = window.GymProUtils;

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function render(container) {
    const [attendanceRes, activeRes, todayRes] = await Promise.all([AttendanceService.list({ page: 1, pageSize: 100 }), AttendanceService.activeCount(), AttendanceService.todayCount()]);
    const attendance = attendanceRes.data.items || [];
    const active = activeRes.data;
    const todayCount = todayRes.data;

    // Active sessions (today)
    const today = new Date().toDateString();
    const activeSessions = attendance.filter((a) => a.status === 'active' && new Date(a.check_in).toDateString() === today);
    const todayLog = attendance
      .filter((a) => new Date(a.check_in).toDateString() === today)
      .sort((a, b) => new Date(b.check_in) - new Date(a.check_in));

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Check In</h1>
            <p>Register member attendance</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-primary" id="btn-checkin">${icon('userCheck')} Check In Member</button>
          </div>
        </div>

        <div class="grid grid-3" style="margin-bottom:24px">
          <div class="card stat-card">
            <div class="stat-card-top">
              <div><div class="stat-value">${num(active)}</div><div class="stat-label">Currently In Gym</div></div>
              <div class="stat-icon" style="background:#dcfce7;color:#16a34a">${icon('users')}</div>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-card-top">
              <div><div class="stat-value">${num(todayCount)}</div><div class="stat-label">Check-ins Today</div></div>
              <div class="stat-icon" style="background:#dbeafe;color:#2563eb">${icon('userCheck')}</div>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-card-top">
              <div><div class="stat-value">${num(activeSessions.length)}</div><div class="stat-label">Active Sessions</div></div>
              <div class="stat-icon" style="background:#fef3c7;color:#d97706">${icon('clock')}</div>
            </div>
          </div>
        </div>

        <div class="grid grid-2">
          <div class="card">
            <div class="card-header"><h3>Active Sessions</h3></div>
            <div class="card-body" style="max-height:480px;overflow-y:auto">
              ${activeSessions.length === 0 ? '<div class="empty-state">No active sessions right now</div>' : activeSessions.map((a) => `
                <div class="activity-item">
                  <div class="avatar ${avatarColor(a.member_name)}">${initials(a.member_name)}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-weight:500;color:#1e293b">${esc(a.member_name)}</div>
                    <div style="font-size:0.75rem;color:#64748b">Checked in at ${time(a.check_in)}</div>
                  </div>
                  <button class="btn btn-sm btn-primary btn-checkout" data-id="${a.id}">Check Out</button>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Today's Log</h3></div>
            <div class="card-body" style="max-height:480px;overflow-y:auto">
              ${todayLog.length === 0 ? '<div class="empty-state">No check-ins today</div>' : todayLog.map((a) => `
                <div class="activity-item">
                  <span class="activity-dot" style="background:${a.status === 'completed' ? '#22c55e' : '#f59e0b'}"></span>
                  <div style="flex:1;min-width:0">
                    <div style="font-weight:500;font-size:0.875rem;color:#1e293b">${esc(a.member_name)}</div>
                    <div style="font-size:0.75rem;color:#64748b">In: ${time(a.check_in)} ${a.check_out ? '· Out: ' + time(a.check_out) : ' · In gym'}</div>
                  </div>
                  <span class="badge ${a.status === 'completed' ? 'badge-success' : 'badge-warning'}">${a.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-checkin').addEventListener('click', () => openCheckinModal(container));
    container.querySelectorAll('.btn-checkout').forEach((btn) => btn.addEventListener('click', async () => {
      await AttendanceService.checkOut(btn.dataset.id);
      toast({ title: 'Checked out', variant: 'success' });
      render(container);
    }));
  }

  function openCheckinModal(container) {
    // List members for selection
    MembersService.list({ page: 1, pageSize: 100 }).then(async (res) => {
      const members = res.data.items || [];
      const body = `
        <div class="form-group">
          <label class="form-label">Search Member</label>
          <div class="search-box">
            ${icon('search')}
            <input type="text" id="checkin-search" class="form-control" placeholder="Search by name or email" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Select Member *</label>
          <select class="form-control" id="checkin-member">
            <option value="">-- Select member --</option>
            ${members.map((m) => `<option value="${m.id}">${esc(m.full_name)} (${m.membership_status})</option>`).join('')}
          </select>
        </div>
      `;
      const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-checkin">${icon('userCheck')} Check In</button>`;
      const overlay = window.GymProUtils.openModal({ title: 'Check In Member', body, footer });

      // Search filter
      const searchInput = overlay.querySelector('#checkin-search');
      const select = overlay.querySelector('#checkin-member');
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        const filtered = members.filter((m) => m.full_name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
        select.innerHTML = `<option value="">-- Select member --</option>` + filtered.map((m) => `<option value="${m.id}">${esc(m.full_name)} (${m.membership_status})</option>`).join('');
      });

      overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
      overlay.querySelector('#f-checkin').addEventListener('click', async () => {
        const memberId = select.value;
        if (!memberId) { toast({ title: 'Please select a member', variant: 'error' }); return; }
        const member = members.find((m) => String(m.id) === String(memberId));
        await AttendanceService.create({
          member_id: Number(memberId),
          member_name: member.full_name,
          branch_id: member.branch_id,
          check_in: new Date().toISOString(),
          status: 'active',
        });
        toast({ title: 'Checked in', description: member.full_name + ' is now in the gym', variant: 'success' });
        window.GymProUtils.closeModal();
        render(container);
      });
    });
  }

  return { render };
})();

window.loadCheckIn = (container) => CheckInPage.render(container);
