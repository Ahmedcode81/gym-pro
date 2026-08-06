/* ============================================================
   GymPro - Trainers Page
   Full CRUD, search, filter, sort, pagination, modal forms.
   ============================================================ */
const TrainersPage = (() => {
  const { icon, esc, initials, avatarColor, openModal, closeModal, confirmDialog, toast, exportCSV, date } = window.GymProUtils;

  let state = { page: 1, pageSize: 10, search: '', sortField: 'full_name', sortDir: 'asc', filterStatus: '', filterBranch: '' };

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function loadBranches() {
    const res = await BranchesService.list();
    return res.data.items || [];
  }

  async function render(container) {
    const branches = await loadBranches();
    const opts = {
      page: state.page, pageSize: state.pageSize, search: state.search,
      searchFields: ['full_name', 'email', 'specialty'],
      sort: { field: state.sortField, dir: state.sortDir }, filters: {},
    };
    if (state.filterStatus) opts.filters.status = state.filterStatus;
    if (state.filterBranch) opts.filters.branch_id = String(state.filterBranch);
    const res = await TrainersService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Trainers</h1>
            <p>${num(total)} certified trainers</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-export">${icon('download')} Export</button>
            <button class="btn btn-primary" id="btn-add">${icon('plus')} Add Trainer</button>
          </div>
        <div class="card">
          <div class="card-body">
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box" style="width:260px">
                  ${icon('search')}
                  <input type="text" id="trainer-search" placeholder="Search trainers..." value="${esc(state.search)}" />
                </div>
                <select class="form-control filter-select" id="filter-status">
                  <option value="">All Status</option>
                  <option value="active" ${state.filterStatus === 'active' ? 'selected' : ''}>Active</option>
                  <option value="inactive" ${state.filterStatus === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
                <select class="form-control filter-select" id="filter-branch">
                  <option value="">All Branches</option>
                  ${branches.map((b) => `<option value="${b.id}" ${String(state.filterBranch) === String(b.id) ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}
                </select>
              </div>
              <div class="toolbar-right"><span style="font-size:0.875rem;color:#64748b">${total} results</span></div>
            <div class="table-wrap">
              <table class="table responsive-table">
                <thead><tr>
                  <th data-sort="full_name">Trainer</th>
                  <th data-sort="specialty">Specialty</th>
                  <th data-sort="experience_years">Experience</th>
                  <th data-sort="hourly_rate">Rate</th>
                  <th data-sort="branch_id">Branch</th>
                  <th data-sort="status">Status</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  ${items.map((t) => {
                    const branch = branches.find((b) => String(b.id) === String(t.branch_id));
                    return `<tr>
                      <td data-label="Trainer">
                        <div style="display:flex;align-items:center;gap:12px">
                          <div class="avatar ${avatarColor(t.full_name)}">${initials(t.full_name)}</div>
                          <div>
                            <div style="font-weight:600;color:#1e293b">${esc(t.full_name)}</div>
                            <div style="font-size:0.75rem;color:#64748b">${esc(t.email)}</div>
                        </div>
                      </td>
                      <td data-label="Specialty"><span style="font-size:0.8125rem">${esc(t.specialty)}</span></td>
                      <td data-label="Experience">${t.experience_years} yrs</td>
                      <td data-label="Rate">$${t.hourly_rate}/hr</td>
                      <td data-label="Branch">${esc(branch ? branch.name : '—')}</td>
                      <td data-label="Status"><span class="badge ${t.status === 'active' ? 'badge-success' : 'badge-neutral'}">${esc(t.status)}</span></td>
                      <td data-label="" style="text-align:right">
                        <button class="btn-icon btn-edit" data-id="${t.id}">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${t.id}">${icon('trash')}</button>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No trainers found</div>' : ''}
            </div>
            <div class="pagination">
              <button id="prev-page" ${state.page <= 1 ? 'disabled' : ''}>${icon('chevronLeft')}</button>
              <span class="page-info">Page ${state.page} of ${totalPages}</span>
              <button id="next-page" ${state.page >= totalPages ? 'disabled' : ''}>${icon('chevronRight')}</button>
            </div>
        </div>
    `;
    setupEvents(container, branches);
  }

  function setupEvents(container, branches) {
    container.querySelector('#btn-add').addEventListener('click', () => buildForm(null, branches));
    container.querySelector('#btn-export').addEventListener('click', () => {
      TrainersService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('trainers.csv', res.data.items.map((t) => ({ Name: t.full_name, Email: t.email, Specialty: t.specialty, Experience: t.experience_years, Rate: t.hourly_rate, Status: t.status })));
      });
    });
    container.querySelector('#trainer-search').addEventListener('input', debounce((e) => { state.search = e.target.value; state.page = 1; render(container); }, 300));
    container.querySelector('#filter-status').addEventListener('change', (e) => { state.filterStatus = e.target.value; state.page = 1; render(container); });
    container.querySelector('#filter-branch').addEventListener('change', (e) => { state.filterBranch = e.target.value; state.page = 1; render(container); });
    container.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
      const f = th.dataset.sort;
      if (state.sortField === f) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortField = f; state.sortDir = 'asc'; }
      render(container);
    }));
    container.querySelector('#prev-page').addEventListener('click', () => { if (state.page > 1) { state.page--; render(container); } });
    container.querySelector('#next-page').addEventListener('click', () => { state.page++; render(container); });
    container.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => buildForm(btn.dataset.id, branches)));
    container.querySelectorAll('.btn-del').forEach((btn) => btn.addEventListener('click', () => {
      confirmDialog({ title: 'Delete trainer', message: 'Delete this trainer?', onConfirm: async () => {
        await TrainersService.remove(btn.dataset.id);
        toast({ title: 'Trainer deleted', variant: 'success' });
        render(container);
      }});
    }));
  }

  function buildForm(id, branches) {
    if (id) { TrainersService.get(id).then((r) => r.data && buildModal(r.data, branches)); }
    else buildModal(null, branches);
  }

  function buildModal(trainer, branches) {
    const isEdit = !!trainer;
    const body = `
      <div class="form-group"><label class="form-label">Full Name *</label><input class="form-control" id="f-name" value="${esc(trainer?.full_name || '')}" required /></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Email *</label><input class="form-control" id="f-email" type="email" value="${esc(trainer?.email || '')}" required /></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-control" id="f-phone" value="${esc(trainer?.phone || '')}" /></div>
      <div class="form-group"><label class="form-label">Specialty</label><input class="form-control" id="f-specialty" value="${esc(trainer?.specialty || '')}" placeholder="e.g. Strength Training, Yoga" /></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Experience (years)</label><input class="form-control" id="f-exp" type="number" value="${trainer?.experience_years || 0}" /></div>
        <div class="form-group"><label class="form-label">Hourly Rate ($)</label><input class="form-control" id="f-rate" type="number" value="${trainer?.hourly_rate || 0}" /></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Branch</label>
          <select class="form-control" id="f-branch">${branches.map((b) => `<option value="${b.id}" ${String(trainer?.branch_id) === String(b.id) ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-control" id="f-status">
            <option value="active" ${trainer?.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="inactive" ${trainer?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      <div class="form-group"><label class="form-label">Bio</label><textarea class="form-control" id="f-bio" rows="2">${esc(trainer?.bio || '')}</textarea></div>
    `;
    const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">${isEdit ? 'Save' : 'Add Trainer'}</button>`;
    const overlay = openModal({ title: isEdit ? 'Edit Trainer' : 'Add Trainer', body, footer });
    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const name = overlay.querySelector('#f-name').value.trim();
      const email = overlay.querySelector('#f-email').value.trim();
      if (!name || !email) { toast({ title: 'Please fill required fields', variant: 'error' }); return; }
      const data = {
        full_name: name, email,
        phone: overlay.querySelector('#f-phone').value,
        specialty: overlay.querySelector('#f-specialty').value,
        experience_years: parseInt(overlay.querySelector('#f-exp').value) || 0,
        hourly_rate: parseFloat(overlay.querySelector('#f-rate').value) || 0,
        branch_id: Number(overlay.querySelector('#f-branch').value),
        status: overlay.querySelector('#f-status').value,
        bio: overlay.querySelector('#f-bio').value,
      };
      if (isEdit) { await TrainersService.update(trainer.id, data); toast({ title: 'Trainer updated', variant: 'success' }); }
      else { await TrainersService.create(data); toast({ title: 'Trainer added', variant: 'success' }); }
      closeModal(); render(container);
    });
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  return { render };
})();

window.loadTrainers = (container) => TrainersPage.render(container);
