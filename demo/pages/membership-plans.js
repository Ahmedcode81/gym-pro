/* ============================================================
   GymPro - Membership Plans Page
   Full CRUD, search, sort, pagination, modal forms.
   ============================================================ */
const MembershipPlansPage = (() => {
  const { icon, esc, money, openModal, closeModal, confirmDialog, toast, exportCSV } = window.GymProUtils;

  let state = { page: 1, pageSize: 10, search: '', sortField: 'name', sortDir: 'asc', filterStatus: '' };

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function render(container) {
    const opts = {
      page: state.page, pageSize: state.pageSize, search: state.search,
      searchFields: ['name'], sort: { field: state.sortField, dir: state.sortDir },
      filters: {},
    };
    if (state.filterStatus) opts.filters.status = state.filterStatus;
    const res = await PlansService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Membership Plans</h1>
            <p>${num(total)} pricing plans</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-export">${icon('download')} Export</button>
            <button class="btn btn-primary" id="btn-add">${icon('plus')} Add Plan</button>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box" style="width:260px">
                  ${icon('search')}
                  <input type="text" id="plan-search" placeholder="Search plans..." value="${esc(state.search)}" />
                </div>
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
                  <th data-sort="name">Plan</th>
                  <th data-sort="price">Price</th>
                  <th data-sort="duration_months">Duration</th>
                  <th data-sort="perks">Perks</th>
                  <th data-sort="status">Status</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  ${items.map((p) => `
                    <tr>
                      <td data-label="Plan"><strong style="color:#1e293b">${esc(p.name)}</strong></td>
                      <td data-label="Price"><strong>${money(p.price)}</strong></td>
                      <td data-label="Duration">${p.duration_months} ${p.duration_months === 1 ? 'month' : 'months'}</td>
                      <td data-label="Perks"><span style="font-size:0.8125rem;color:#64748b">${esc(p.perks)}</span></td>
                      <td data-label="Status"><span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-neutral'}">${esc(p.status)}</span></td>
                      <td data-label="" style="text-align:right">
                        <button class="btn-icon btn-edit" data-id="${p.id}" aria-label="Edit">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${p.id}" aria-label="Delete">${icon('trash')}</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No plans found</div>' : ''}
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
    setupEvents(container);
  }

  function setupEvents(container) {
    container.querySelector('#btn-add').addEventListener('click', () => buildForm(null));
    container.querySelector('#btn-export').addEventListener('click', () => {
      PlansService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('membership-plans.csv', res.data.items.map((p) => ({ Name: p.name, Price: p.price, Duration: p.duration_months + 'm', Perks: p.perks, Status: p.status })));
      });
    });
    container.querySelector('#plan-search').addEventListener('input', debounce((e) => { state.search = e.target.value; state.page = 1; render(container); }, 300));
    container.querySelector('#filter-status').addEventListener('change', (e) => { state.filterStatus = e.target.value; state.page = 1; render(container); });
    container.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
      const f = th.dataset.sort;
      if (state.sortField === f) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortField = f; state.sortDir = 'asc'; }
      render(container);
    }));
    container.querySelector('#prev-page').addEventListener('click', () => { if (state.page > 1) { state.page--; render(container); } });
    container.querySelector('#next-page').addEventListener('click', () => { state.page++; render(container); });
    container.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => buildForm(btn.dataset.id)));
    container.querySelectorAll('.btn-del').forEach((btn) => btn.addEventListener('click', () => {
      confirmDialog({ title: 'Delete plan', message: 'Delete this membership plan?', onConfirm: async () => {
        await PlansService.remove(btn.dataset.id);
        toast({ title: 'Plan deleted', variant: 'success' });
        render(container);
      }});
    }));
  }

  function buildForm(id) {
    if (id) { PlansService.get(id).then((r) => r.data && buildModal(r.data)); }
    else buildModal(null);
  }

  function buildModal(plan) {
    const isEdit = !!plan;
    const body = `
      <div class="form-group"><label class="form-label">Plan Name *</label><input class="form-control" id="f-name" value="${esc(plan?.name || '')}" required /></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Price ($) *</label><input class="form-control" id="f-price" type="number" step="0.01" value="${plan?.price || ''}" required /></div>
        <div class="form-group"><label class="form-label">Duration (months) *</label><input class="form-control" id="f-duration" type="number" value="${plan?.duration_months || 1}" required /></div>
      </div>
      <div class="form-group"><label class="form-label">Perks (comma separated)</label><input class="form-control" id="f-perks" value="${esc(plan?.perks || '')}" /></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" id="f-desc" rows="2">${esc(plan?.description || '')}</textarea></div>
      <div class="form-group"><label class="form-label">Status</label>
        <select class="form-control" id="f-status">
          <option value="active" ${plan?.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${plan?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    `;
    const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">${isEdit ? 'Save' : 'Add Plan'}</button>`;
    const overlay = openModal({ title: isEdit ? 'Edit Plan' : 'Add Membership Plan', body, footer });
    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const name = overlay.querySelector('#f-name').value.trim();
      const price = parseFloat(overlay.querySelector('#f-price').value);
      if (!name || isNaN(price)) { toast({ title: 'Please fill required fields', variant: 'error' }); return; }
      const data = {
        name,
        price,
        duration_months: parseInt(overlay.querySelector('#f-duration').value) || 1,
        perks: overlay.querySelector('#f-perks').value,
        description: overlay.querySelector('#f-desc').value,
        status: overlay.querySelector('#f-status').value,
      };
      if (isEdit) { await PlansService.update(plan.id, data); toast({ title: 'Plan updated', variant: 'success' }); }
      else { await PlansService.create(data); toast({ title: 'Plan added', variant: 'success' }); }
      closeModal(); render(container);
    });
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  return { render };
})();

window.loadMembershipPlans = (container) => MembershipPlansPage.render(container);
