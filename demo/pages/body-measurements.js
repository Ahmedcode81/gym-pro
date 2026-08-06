/* ============================================================
   GymPro - Body Measurements Page
   Full CRUD, search, filter, sort, pagination, modal forms.
   ============================================================ */
const BodyMeasurementsPage = (() => {
  const { icon, esc, initials, avatarColor, openModal, closeModal, confirmDialog, toast, exportCSV, date } = window.GymProUtils;

  let state = { page: 1, pageSize: 10, search: '', sortField: 'date', sortDir: 'desc', filterType: '' };

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function loadMembers() {
    const res = await MembersService.list({ page: 1, pageSize: 100 });
    return res.data.items || [];
  }

  async function render(container) {
    const members = await loadMembers();
    const opts = {
      page: state.page, pageSize: state.pageSize, search: state.search,
      searchFields: ['member_name', 'type'], sort: { field: state.sortField, dir: state.sortDir }, filters: {},
    };
    if (state.filterType) opts.filters.type = state.filterType;
    const res = await MeasurementsService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    const types = ['Weight', 'Body Fat %', 'Chest', 'Waist', 'Hips', 'Biceps', 'Thighs', 'Shoulders'];

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Body Measurements</h1>
            <p>${num(total)} measurement records</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-export">${icon('download')} Export</button>
            <button class="btn btn-primary" id="btn-add">${icon('plus')} Add Measurement</button>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box" style="width:260px">
                  ${icon('search')}
                  <input type="text" id="measure-search" placeholder="Search..." value="${esc(state.search)}" />
                </div>
                <select class="form-control filter-select" id="filter-type">
                  <option value="">All Types</option>
                  ${types.map((t) => `<option value="${t}" ${state.filterType === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </div>
              <div class="toolbar-right"><span style="font-size:0.875rem;color:#64748b">${total} results</span></div>
            </div>
            <div class="table-wrap">
              <table class="table responsive-table">
                <thead><tr>
                  <th data-sort="member_name">Member</th>
                  <th data-sort="type">Type</th>
                  <th data-sort="value">Value</th>
                  <th data-sort="date">Date</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  ${items.map((m) => `
                    <tr>
                      <td data-label="Member">
                        <div style="display:flex;align-items:center;gap:12px">
                          <div class="avatar avatar-blue" style="width:32px;height:32px;font-size:0.75rem">${initials(m.member_name)}</div>
                          <div><strong style="color:#1e293b">${esc(m.member_name)}</strong></div>
                        </div>
                      </td>
                      <td data-label="Type">${esc(m.type)}</td>
                      <td data-label="Value"><strong>${m.value} ${esc(m.unit)}</strong></td>
                      <td data-label="Date">${date(m.date)}</td>
                      <td data-label="" style="text-align:right">
                        <button class="btn-icon btn-edit" data-id="${m.id}">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${m.id}">${icon('trash')}</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No measurements found</div>' : ''}
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
    setupEvents(container, members, types);
  }

  function setupEvents(container, members, types) {
    container.querySelector('#btn-add').addEventListener('click', () => buildForm(null, members, types));
    container.querySelector('#btn-export').addEventListener('click', () => {
      MeasurementsService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('measurements.csv', res.data.items.map((m) => ({ Member: m.member_name, Type: m.type, Value: m.value, Unit: m.unit, Date: m.date })));
      });
    });
    container.querySelector('#measure-search').addEventListener('input', debounce((e) => { state.search = e.target.value; state.page = 1; render(container); }, 300));
    container.querySelector('#filter-type').addEventListener('change', (e) => { state.filterType = e.target.value; state.page = 1; render(container); });
    container.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
      const f = th.dataset.sort;
      if (state.sortField === f) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortField = f; state.sortDir = 'asc'; }
      render(container);
    }));
    container.querySelector('#prev-page').addEventListener('click', () => { if (state.page > 1) { state.page--; render(container); } });
    container.querySelector('#next-page').addEventListener('click', () => { state.page++; render(container); });
    container.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => buildForm(btn.dataset.id, members, types)));
    container.querySelectorAll('.btn-del').forEach((btn) => btn.addEventListener('click', () => {
      confirmDialog({ title: 'Delete record', message: 'Delete this measurement?', onConfirm: async () => {
        await MeasurementsService.remove(btn.dataset.id);
        toast({ title: 'Record deleted', variant: 'success' });
        render(container);
      }});
    }));
  }

  function buildForm(id, members, types) {
    if (id) { MeasurementsService.get(id).then((r) => r.data && buildModal(r.data, members, types)); }
    else buildModal(null, members, types);
  }

  function buildModal(meas, members, types) {
    const isEdit = !!meas;
    const body = `
      <div class="form-group"><label class="form-label">Member *</label>
        <select class="form-control" id="f-member">${members.map((m) => `<option value="${m.id}" ${String(meas?.member_id) === String(m.id) ? 'selected' : ''}>${esc(m.full_name)}</option>`).join('')}</select>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Type</label>
          <select class="form-control" id="f-type">${types.map((t) => `<option value="${t}" ${meas?.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Unit</label>
          <select class="form-control" id="f-unit">
            <option value="kg" ${meas?.unit === 'kg' ? 'selected' : ''}>kg</option>
            <option value="cm" ${meas?.unit === 'cm' ? 'selected' : ''}>cm</option>
            <option value="%" ${meas?.unit === '%' ? 'selected' : ''}>%</option>
            <option value="in" ${meas?.unit === 'in' ? 'selected' : ''}>in</option>
          </select>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Value</label><input class="form-control" id="f-value" type="number" step="0.1" value="${meas?.value || ''}" /></div>
        <div class="form-group"><label class="form-label">Date</label><input class="form-control" id="f-date" type="date" value="${meas?.date || new Date().toISOString().slice(0, 10)}" /></div>
      </div>
    `;
    const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">${isEdit ? 'Save' : 'Add Measurement'}</button>`;
    const overlay = openModal({ title: isEdit ? 'Edit Measurement' : 'Add Measurement', body, footer });
    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const memberId = overlay.querySelector('#f-member').value;
      if (!memberId) { toast({ title: 'Please select a member', variant: 'error' }); return; }
      const data = {
        member_id: Number(memberId),
        type: overlay.querySelector('#f-type').value,
        unit: overlay.querySelector('#f-unit').value,
        value: parseFloat(overlay.querySelector('#f-value').value) || 0,
        date: overlay.querySelector('#f-date').value,
      };
      if (isEdit) { await MeasurementsService.update(meas.id, data); toast({ title: 'Measurement updated', variant: 'success' }); }
      else { await MeasurementsService.create(data); toast({ title: 'Measurement added', variant: 'success' }); }
      closeModal(); render(container);
    });
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  return { render };
})();

window.loadBodyMeasurements = (container) => BodyMeasurementsPage.render(container);
