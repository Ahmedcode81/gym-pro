/* ============================================================
   GymPro - Group Classes Page
   Full CRUD, search, filter, sort, pagination, modal forms.
   ============================================================ */
const GroupClassesPage = (() => {
  const { icon, esc, openModal, closeModal, confirmDialog, toast, exportCSV } = window.GymProUtils;

  let state = { page: 1, pageSize: 10, search: '', sortField: 'name', sortDir: 'asc', filterDay: '', filterStatus: '' };

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function loadTrainers() {
    const res = await TrainersService.list({ page: 1, pageSize: 100 });
    return res.data.items || [];
  }
  async function loadBranches() {
    const res = await BranchesService.list();
    return res.data.items || [];
  }

  async function render(container) {
    const [trainers, branches] = await Promise.all([loadTrainers(), loadBranches()]);
    const opts = {
      page: state.page, pageSize: state.pageSize, search: state.search,
      searchFields: ['name', 'trainer_name'], sort: { field: state.sortField, dir: state.sortDir }, filters: {},
    };
    if (state.filterDay) opts.filters.day = state.filterDay;
    if (state.filterStatus) opts.filters.status = state.filterStatus;
    const res = await ClassesService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Group Classes</h1>
            <p>${num(total)} scheduled classes</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-export">${icon('download')} Export</button>
            <button class="btn btn-primary" id="btn-add">${icon('plus')} Add Class</button>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box" style="width:260px">
                  ${icon('search')}
                  <input type="text" id="class-search" placeholder="Search classes..." value="${esc(state.search)}" />
                </div>
                <select class="form-control filter-select" id="filter-day">
                  <option value="">All Days</option>
                  ${days.map((d) => `<option value="${d}" ${state.filterDay === d ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
                <select class="form-control filter-select" id="filter-status">
                  <option value="">All Status</option>
                  <option value="active" ${state.filterStatus === 'active' ? 'selected' : ''}>Active</option>
                  <option value="inactive" ${state.filterStatus === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
              </div>
              <div class="toolbar-right"><span style="font-size:0.875rem;color:#64748b">${total} results</span></div>
            </div>
            <div class="table-wrap">
              <table class="table responsive-table">
                <thead><tr>
                  <th data-sort="name">Class</th>
                  <th data-sort="trainer_name">Trainer</th>
                  <th data-sort="day">Schedule</th>
                  <th data-sort="enrolled">Enrollment</th>
                  <th data-sort="branch_id">Branch</th>
                  <th data-sort="status">Status</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  ${items.map((c) => {
                    const branch = branches.find((b) => String(b.id) === String(c.branch_id));
                    const pct = Math.min(100, Math.round((c.enrolled / c.capacity) * 100));
                    const barColor = pct >= 100 ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#2563eb';
                    return `<tr>
                      <td data-label="Class"><strong style="color:#1e293b">${esc(c.name)}</strong></td>
                      <td data-label="Trainer">${esc(c.trainer_name || '—')}</td>
                      <td data-label="Schedule">${esc(c.day)} at ${esc(c.time)}</td>
                      <td data-label="Enrollment">
                        <div style="min-width:120px">
                          <div style="font-size:0.8125rem">${c.enrolled}/${c.capacity}</div>
                          <div class="progress-track" style="height:6px;margin-top:4px"><div class="progress-bar" style="width:${pct}%;background:${barColor}"></div></div>
                        </div>
                      </td>
                      <td data-label="Branch">${esc(branch ? branch.name : '—')}</td>
                      <td data-label="Status"><span class="badge ${c.status === 'active' ? 'badge-success' : 'badge-neutral'}">${esc(c.status)}</span></td>
                      <td data-label="" style="text-align:right">
                        <button class="btn-icon btn-edit" data-id="${c.id}">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${c.id}">${icon('trash')}</button>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No classes found</div>' : ''}
            </div>
            <div class="pagination">
              <button id="prev-page" ${state.page <= 1 ? 'disabled' : ''}>${icon('chevronLeft')}</button>
              <span class="page-info">Page ${state.page} of ${totalPages}</span>
              <button id="next-page" ${state.page >= totalPages ? 'disabled' : ''}>${icon('chevronRight')}</button>
            </div>
          </div>
        </div>
      </div>
    `;
    setupEvents(container, trainers, branches);
  }

  function setupEvents(container, trainers, branches) {
    container.querySelector('#btn-add').addEventListener('click', () => buildForm(null, trainers, branches));
    container.querySelector('#btn-export').addEventListener('click', () => {
      ClassesService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('classes.csv', res.data.items.map((c) => ({ Name: c.name, Trainer: c.trainer_name, Day: c.day, Time: c.time, Enrolled: c.enrolled, Capacity: c.capacity, Status: c.status })));
      });
    });
    container.querySelector('#class-search').addEventListener('input', debounce((e) => { state.search = e.target.value; state.page = 1; render(container); }, 300));
    container.querySelector('#filter-day').addEventListener('change', (e) => { state.filterDay = e.target.value; state.page = 1; render(container); });
    container.querySelector('#filter-status').addEventListener('change', (e) => { state.filterStatus = e.target.value; state.page = 1; render(container); });
    container.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
      const f = th.dataset.sort;
      if (state.sortField === f) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortField = f; state.sortDir = 'asc'; }
      render(container);
    }));
    container.querySelector('#prev-page').addEventListener('click', () => { if (state.page > 1) { state.page--; render(container); } });
    container.querySelector('#next-page').addEventListener('click', () => { state.page++; render(container); });
    container.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => buildForm(btn.dataset.id, trainers, branches)));
    container.querySelectorAll('.btn-del').forEach((btn) => btn.addEventListener('click', () => {
      confirmDialog({ title: 'Delete class', message: 'Delete this class?', onConfirm: async () => {
        await ClassesService.remove(btn.dataset.id);
        toast({ title: 'Class deleted', variant: 'success' });
        render(container);
      }});
    }));
  }

  function buildForm(id, trainers, branches) {
    if (id) { ClassesService.get(id).then((r) => r.data && buildModal(r.data, trainers, branches)); }
    else buildModal(null, trainers, branches);
  }

  function buildModal(cls, trainers, branches) {
    const isEdit = !!cls;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const body = `
      <div class="form-group"><label class="form-label">Class Name *</label><input class="form-control" id="f-name" value="${esc(cls?.name || '')}" required /></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Trainer</label>
          <select class="form-control" id="f-trainer">${trainers.map((t) => `<option value="${t.id}" ${String(cls?.trainer_id) === String(t.id) ? 'selected' : ''}>${esc(t.full_name)}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Branch</label>
          <select class="form-control" id="f-branch">${branches.map((b) => `<option value="${b.id}" ${String(cls?.branch_id) === String(b.id) ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Day</label>
          <select class="form-control" id="f-day">${days.map((d) => `<option value="${d}" ${cls?.day === d ? 'selected' : ''}>${d}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Time</label>
          <select class="form-control" id="f-time">${['06:00','07:00','08:00','09:00','10:00','17:00','18:00','19:00','20:00'].map((t) => `<option value="${t}" ${cls?.time === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Capacity</label><input class="form-control" id="f-capacity" type="number" value="${cls?.capacity || 20}" /></div>
        <div class="form-group"><label class="form-label">Room</label><input class="form-control" id="f-room" value="${esc(cls?.room || 'Studio 1')}" /></div>
      </div>
      <div class="form-group"><label class="form-label">Status</label>
        <select class="form-control" id="f-status">
          <option value="active" ${cls?.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${cls?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    `;
    const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">${isEdit ? 'Save' : 'Add Class'}</button>`;
    const overlay = openModal({ title: isEdit ? 'Edit Class' : 'Add Group Class', body, footer });
    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const name = overlay.querySelector('#f-name').value.trim();
      if (!name) { toast({ title: 'Please enter a class name', variant: 'error' }); return; }
      const data = {
        name,
        trainer_id: Number(overlay.querySelector('#f-trainer').value),
        branch_id: Number(overlay.querySelector('#f-branch').value),
        day: overlay.querySelector('#f-day').value,
        time: overlay.querySelector('#f-time').value,
        capacity: parseInt(overlay.querySelector('#f-capacity').value) || 20,
        room: overlay.querySelector('#f-room').value,
        status: overlay.querySelector('#f-status').value,
      };
      if (isEdit) { await ClassesService.update(cls.id, data); toast({ title: 'Class updated', variant: 'success' }); }
      else { await ClassesService.create(data); toast({ title: 'Class added', variant: 'success' }); }
      closeModal(); render(container);
    });
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  return { render };
})();

window.loadGroupClasses = (container) => GroupClassesPage.render(container);
