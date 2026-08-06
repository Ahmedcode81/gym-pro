/* ============================================================
   GymPro - Equipment Page
   Full CRUD, search, filter, sort, pagination, maintenance.
   ============================================================ */
const EquipmentPage = (() => {
  const { icon, esc, date, openModal, closeModal, confirmDialog, toast, exportCSV } = window.GymProUtils;

  let state = { page: 1, pageSize: 10, search: '', sortField: 'name', sortDir: 'asc', filterStatus: '' };

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function loadBranches() {
    const res = await BranchesService.list();
    return res.data.items || [];
  }

  async function render(container) {
    const branches = await loadBranches();
    const opts = {
      page: state.page, pageSize: state.pageSize, search: state.search,
      searchFields: ['name', 'type', 'brand', 'serial_number'], sort: { field: state.sortField, dir: state.sortDir }, filters: {},
    };
    if (state.filterStatus) opts.filters.status = state.filterStatus;
    const res = await EquipmentService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Equipment</h1>
            <p>${num(total)} equipment items</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-export">${icon('download')} Export</button>
            <button class="btn btn-primary" id="btn-add">${icon('plus')} Add Equipment</button>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box" style="width:260px">
                  ${icon('search')}
                  <input type="text" id="eq-search" placeholder="Search equipment..." value="${esc(state.search)}" />
                </div>
                <select class="form-control filter-select" id="filter-status">
                  <option value="">All Status</option>
                  <option value="operational" ${state.filterStatus === 'operational' ? 'selected' : ''}>Operational</option>
                  <option value="maintenance" ${state.filterStatus === 'maintenance' ? 'selected' : ''}>In Maintenance</option>
                  <option value="out_of_service" ${state.filterStatus === 'out_of_service' ? 'selected' : ''}>Out of Service</option>
                </select>
              </div>
              <div class="toolbar-right"><span style="font-size:0.875rem;color:#64748b">${total} results</span></div>
            </div>
            <div class="table-wrap">
              <table class="table responsive-table">
                <thead><tr>
                  <th data-sort="name">Equipment</th>
                  <th data-sort="type">Type</th>
                  <th data-sort="brand">Brand</th>
                  <th data-sort="branch_id">Branch</th>
                  <th data-sort="status">Status</th>
                  <th data-sort="next_maintenance">Next Maintenance</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  ${items.map((e) => {
                    const branch = branches.find((b) => String(b.id) === String(e.branch_id));
                    const statusBadge = e.status === 'operational' ? 'badge-success' : e.status === 'maintenance' ? 'badge-warning' : 'badge-danger';
                    return `<tr>
                      <td data-label="Equipment">
                        <strong style="color:#1e293b">${esc(e.name)}</strong>
                        <div style="font-size:0.75rem;color:#64748b">${esc(e.serial_number)}</div>
                      </td>
                      <td data-label="Type">${esc(e.type)}</td>
                      <td data-label="Brand">${esc(e.brand)}</td>
                      <td data-label="Branch">${esc(branch ? branch.name : '—')}</td>
                      <td data-label="Status"><span class="badge ${statusBadge}">${esc(e.status)}</span></td>
                      <td data-label="Next Maintenance">${date(e.next_maintenance)}</td>
                      <td data-label="" style="text-align:right">
                        ${e.status === 'operational' ? `<button class="btn-icon btn-icon-danger" data-maint="${e.id}" title="Mark maintenance">${icon('tool', 'wrench')}</button>` : ''}
                        <button class="btn-icon btn-edit" data-id="${e.id}">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${e.id}">${icon('trash')}</button>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No equipment found</div>' : ''}
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
    setupEvents(container, branches);
  }

  function setupEvents(container, branches) {
    container.querySelector('#btn-add').addEventListener('click', () => buildForm(null, branches));
    container.querySelector('#btn-export').addEventListener('click', () => {
      EquipmentService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('equipment.csv', res.data.items.map((e) => ({ Name: e.name, Type: e.type, Brand: e.brand, Status: e.status, Serial: e.serial_number })));
      });
    });
    container.querySelector('#eq-search').addEventListener('input', debounce((e) => { state.search = e.target.value; state.page = 1; render(container); }, 300));
    container.querySelector('#filter-status').addEventListener('change', (e) => { state.filterStatus = e.target.value; state.page = 1; render(container); });
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
      confirmDialog({ title: 'Delete equipment', message: 'Delete this equipment?', onConfirm: async () => {
        await EquipmentService.remove(btn.dataset.id);
        toast({ title: 'Equipment deleted', variant: 'success' });
        render(container);
      }});
    }));
    container.querySelectorAll('[data-maint]').forEach((btn) => btn.addEventListener('click', async () => {
      await EquipmentService.markMaintenance(btn.dataset.maint);
      toast({ title: 'Marked for maintenance', variant: 'info' });
      render(container);
    }));
  }

  function buildForm(id, branches) {
    if (id) { EquipmentService.get(id).then((r) => r.data && buildModal(r.data, branches)); }
    else buildModal(null, branches);
  }

  function buildModal(eq, branches) {
    const isEdit = !!eq;
    const body = `
      <div class="form-group"><label class="form-label">Equipment Name *</label><input class="form-control" id="f-name" value="${esc(eq?.name || '')}" required /></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Type</label><input class="form-control" id="f-type" value="${esc(eq?.type || '')}" /></div>
        <div class="form-group"><label class="form-label">Brand</label><input class="form-control" id="f-brand" value="${esc(eq?.brand || '')}" /></div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Serial Number</label><input class="form-control" id="f-serial" value="${esc(eq?.serial_number || '')}" /></div>
        <div class="form-group"><label class="form-label">Branch</label>
          <select class="form-control" id="f-branch">${branches.map((b) => `<option value="${b.id}" ${String(eq?.branch_id) === String(b.id) ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-control" id="f-status">
            <option value="operational" ${eq?.status === 'operational' ? 'selected' : ''}>Operational</option>
            <option value="maintenance" ${eq?.status === 'maintenance' ? 'selected' : ''}>In Maintenance</option>
            <option value="out_of_service" ${eq?.status === 'out_of_service' ? 'selected' : ''}>Out of Service</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Condition</label>
          <select class="form-control" id="f-condition">
            <option value="new" ${eq?.condition === 'new' ? 'selected' : ''}>New</option>
            <option value="good" ${eq?.condition === 'good' ? 'selected' : ''}>Good</option>
            <option value="fair" ${eq?.condition === 'fair' ? 'selected' : ''}>Fair</option>
            <option value="needs_maintenance" ${eq?.condition === 'needs_maintenance' ? 'selected' : ''}>Needs Maintenance</option>
          </select>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Purchase Date</label><input class="form-control" id="f-purchase" type="date" value="${eq?.purchase_date || ''}" /></div>
        <div class="form-group"><label class="form-label">Next Maintenance</label><input class="form-control" id="f-next" type="date" value="${eq?.next_maintenance || ''}" /></div>
      </div>
    `;
    const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">${isEdit ? 'Save' : 'Add Equipment'}</button>`;
    const overlay = openModal({ title: isEdit ? 'Edit Equipment' : 'Add Equipment', body, footer });
    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const name = overlay.querySelector('#f-name').value.trim();
      if (!name) { toast({ title: 'Please enter equipment name', variant: 'error' }); return; }
      const data = {
        name,
        type: overlay.querySelector('#f-type').value,
        brand: overlay.querySelector('#f-brand').value,
        serial_number: overlay.querySelector('#f-serial').value,
        branch_id: Number(overlay.querySelector('#f-branch').value),
        status: overlay.querySelector('#f-status').value,
        condition: overlay.querySelector('#f-condition').value,
        purchase_date: overlay.querySelector('#f-purchase').value,
        next_maintenance: overlay.querySelector('#f-next').value,
      };
      if (isEdit) { await EquipmentService.update(eq.id, data); toast({ title: 'Equipment updated', variant: 'success' }); }
      else { await EquipmentService.create(data); toast({ title: 'Equipment added', variant: 'success' }); }
      closeModal(); render(container);
    });
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  return { render };
})();

window.loadEquipment = (container) => EquipmentPage.render(container);
