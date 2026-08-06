/* ============================================================
   GymPro - Branches Page
   Full CRUD, search, sort, pagination, modal forms.
   ============================================================ */
const BranchesPage = (() => {
  const { icon, esc, openModal, closeModal, confirmDialog, toast, exportCSV } = window.GymProUtils;

  let state = { page: 1, pageSize: 10, search: '', sortField: 'name', sortDir: 'asc' };

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function render(container) {
    const opts = {
      page: state.page, pageSize: state.pageSize, search: state.search,
      searchFields: ['name', 'manager', 'city', 'phone'], sort: { field: state.sortField, dir: state.sortDir },
    };
    const res = await BranchesService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Branches</h1>
            <p>${num(total)} locations</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-export">${icon('download')} Export</button>
            <button class="btn btn-primary" id="btn-add">${icon('plus')} Add Branch</button>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box" style="width:260px">
                  ${icon('search')}
                  <input type="text" id="branch-search" placeholder="Search branches..." value="${esc(state.search)}" />
                </div>
              </div>
              <div class="toolbar-right"><span style="font-size:0.875rem;color:#64748b">${total} results</span></div>
            </div>
            <div class="table-wrap">
              <table class="table responsive-table">
                <thead><tr>
                  <th data-sort="name">Branch</th>
                  <th data-sort="manager">Manager</th>
                  <th data-sort="phone">Phone</th>
                  <th data-sort="city">City</th>
                  <th data-sort="status">Status</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  ${items.map((b) => `
                    <tr>
                      <td data-label="Branch">
                        <strong style="color:#1e293b">${esc(b.name)}</strong>
                        <div style="font-size:0.75rem;color:#64748b">${esc(b.address || '')}</div>
                      </td>
                      <td data-label="Manager">${esc(b.manager || '—')}</td>
                      <td data-label="Phone">${esc(b.phone || '—')}</td>
                      <td data-label="City">${esc(b.city || '—')}</td>
                      <td data-label="Status"><span class="badge ${b.status === 'active' ? 'badge-success' : 'badge-neutral'}">${esc(b.status)}</span></td>
                      <td data-label="" style="text-align:right">
                        <button class="btn-icon btn-edit" data-id="${b.id}">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${b.id}">${icon('trash')}</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No branches found</div>' : ''}
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
      BranchesService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('branches.csv', res.data.items.map((b) => ({ Name: b.name, Manager: b.manager, Phone: b.phone, City: b.city, Status: b.status })));
      });
    });
    container.querySelector('#branch-search').addEventListener('input', debounce((e) => { state.search = e.target.value; state.page = 1; render(container); }, 300));
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
      confirmDialog({ title: 'Delete branch', message: 'Delete this branch?', onConfirm: async () => {
        await BranchesService.remove(btn.dataset.id);
        toast({ title: 'Branch deleted', variant: 'success' });
        render(container);
      }});
    }));
  }

  function buildForm(id) {
    if (id) { BranchesService.get(id).then((r) => r.data && buildModal(r.data)); }
    else buildModal(null);
  }

  function buildModal(branch) {
    const isEdit = !!branch;
    const body = `
      <div class="form-group"><label class="form-label">Branch Name *</label><input class="form-control" id="f-name" value="${esc(branch?.name || '')}" required /></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Manager</label><input class="form-control" id="f-manager" value="${esc(branch?.manager || '')}" /></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-control" id="f-phone" value="${esc(branch?.phone || '')}" /></div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">City</label><input class="form-control" id="f-city" value="${esc(branch?.city || '')}" /></div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-control" id="f-status">
            <option value="active" ${branch?.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="inactive" ${branch?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Address</label><input class="form-control" id="f-address" value="${esc(branch?.address || '')}" /></div>
    `;
    const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">${isEdit ? 'Save' : 'Add Branch'}</button>`;
    const overlay = openModal({ title: isEdit ? 'Edit Branch' : 'Add Branch', body, footer });
    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const name = overlay.querySelector('#f-name').value.trim();
      if (!name) { toast({ title: 'Please enter a branch name', variant: 'error' }); return; }
      const data = {
        name,
        manager: overlay.querySelector('#f-manager').value,
        phone: overlay.querySelector('#f-phone').value,
        city: overlay.querySelector('#f-city').value,
        address: overlay.querySelector('#f-address').value,
        status: overlay.querySelector('#f-status').value,
      };
      if (isEdit) { await BranchesService.update(branch.id, data); toast({ title: 'Branch updated', variant: 'success' }); }
      else { await BranchesService.create(data); toast({ title: 'Branch added', variant: 'success' }); }
      closeModal(); render(container);
    });
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  return { render };
})();

window.loadBranches = (container) => BranchesPage.render(container);
