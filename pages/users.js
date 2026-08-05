/* ============================================================
   GymPro - Users Page (User Management)
   Full CRUD, search, filter, sort, pagination, role assignment.
   ============================================================ */
const UsersPage = (() => {
  const { icon, esc, initials, avatarColor, openModal, closeModal, confirmDialog, toast, exportCSV, date } = window.GymProUtils;

  let state = { page: 1, pageSize: 10, search: '', sortField: 'full_name', sortDir: 'asc', filterRole: '' };

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function loadBranches() {
    const res = await BranchesService.list();
    return res.data.items || [];
  }

  async function render(container) {
    const branches = await loadBranches();
    const roles = GymProAuth.allRoles();
    const opts = {
      page: state.page, pageSize: state.pageSize, search: state.search,
      searchFields: ['full_name', 'email'], sort: { field: state.sortField, dir: state.sortDir }, filters: {},
    };
    if (state.filterRole) opts.filters.role = state.filterRole;
    const res = await UsersService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Users</h1>
            <p>${num(total)} user accounts</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-export">${icon('download')} Export</button>
            <button class="btn btn-primary" id="btn-add">${icon('userPlus')} Add User</button>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box" style="width:260px">
                  ${icon('search')}
                  <input type="text" id="user-search" placeholder="Search users..." value="${esc(state.search)}" />
                </div>
                <select class="form-control filter-select" id="filter-role">
                  <option value="">All Roles</option>
                  ${roles.map((r) => `<option value="${r.value}" ${state.filterRole === r.value ? 'selected' : ''}>${r.label}</option>`).join('')}
                </select>
              </div>
              <div class="toolbar-right"><span style="font-size:0.875rem;color:#64748b">${total} results</span></div>
            </div>
            <div class="table-wrap">
              <table class="table responsive-table">
                <thead><tr>
                  <th data-sort="full_name">User</th>
                  <th data-sort="role">Role</th>
                  <th data-sort="branch_id">Branch</th>
                  <th data-sort="status">Status</th>
                  <th data-sort="created_at">Created</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  ${items.map((u) => {
                    const branch = branches.find((b) => String(b.id) === String(u.branch_id));
                    const role = roles.find((r) => r.value === u.role);
                    return `<tr>
                      <td data-label="User">
                        <div style="display:flex;align-items:center;gap:12px">
                          <div class="avatar ${avatarColor(u.full_name)}">${initials(u.full_name)}</div>
                          <div>
                            <div style="font-weight:600;color:#1e293b">${esc(u.full_name)}</div>
                            <div style="font-size:0.75rem;color:#64748b">${esc(u.email)}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Role"><span class="badge badge-purple">${esc(role ? role.label : u.role)}</span></td>
                      <td data-label="Branch">${esc(branch ? branch.name : '—')}</td>
                      <td data-label="Status"><span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-neutral'}">${esc(u.status)}</span></td>
                      <td data-label="Created">${date(u.created_at)}</td>
                      <td data-label="" style="text-align:right">
                        <button class="btn-icon btn-edit" data-id="${u.id}">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${u.id}">${icon('trash')}</button>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No users found</div>' : ''}
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
    setupEvents(container, branches, roles);
  }

  function setupEvents(container, branches, roles) {
    container.querySelector('#btn-add').addEventListener('click', () => buildForm(null, branches, roles));
    container.querySelector('#btn-export').addEventListener('click', () => {
      UsersService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('users.csv', res.data.items.map((u) => ({ Name: u.full_name, Email: u.email, Role: u.role, Status: u.status })));
      });
    });
    container.querySelector('#user-search').addEventListener('input', debounce((e) => { state.search = e.target.value; state.page = 1; render(container); }, 300));
    container.querySelector('#filter-role').addEventListener('change', (e) => { state.filterRole = e.target.value; state.page = 1; render(container); });
    container.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
      const f = th.dataset.sort;
      if (state.sortField === f) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortField = f; state.sortDir = 'asc'; }
      render(container);
    }));
    container.querySelector('#prev-page').addEventListener('click', () => { if (state.page > 1) { state.page--; render(container); } });
    container.querySelector('#next-page').addEventListener('click', () => { state.page++; render(container); });
    container.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => buildForm(btn.dataset.id, branches, roles)));
    container.querySelectorAll('.btn-del').forEach((btn) => btn.addEventListener('click', () => {
      confirmDialog({ title: 'Delete user', message: 'Delete this user account?', onConfirm: async () => {
        const res = await UsersService.remove(btn.dataset.id);
        if (res.error) { toast({ title: 'Error', description: res.error, variant: 'error' }); }
        else { toast({ title: 'User deleted', variant: 'success' }); }
        render(container);
      }});
    }));
  }

  function buildForm(id, branches, roles) {
    if (id) { UsersService.get(id).then((r) => r.data && buildModal(r.data, branches, roles)); }
    else buildModal(null, branches, roles);
  }

  function buildModal(user, branches, roles) {
    const isEdit = !!user;
    const body = `
      <div class="form-group"><label class="form-label">Full Name *</label><input class="form-control" id="f-name" value="${esc(user?.full_name || '')}" required /></div>
      <div class="form-group"><label class="form-label">Email *</label><input class="form-control" id="f-email" type="email" value="${esc(user?.email || '')}" required /></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Role</label>
          <select class="form-control" id="f-role">${roles.map((r) => `<option value="${r.value}" ${user?.role === r.value ? 'selected' : ''}>${r.label}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Branch</label>
          <select class="form-control" id="f-branch">${branches.map((b) => `<option value="${b.id}" ${String(user?.branch_id) === String(b.id) ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select>
        </div>
      </div>
      ${isEdit ? '' : `<div class="form-group"><label class="form-label">Password</label><input class="form-control" id="f-password" type="text" value="pass123" /></div>`}
      <div class="form-group"><label class="form-label">Status</label>
        <select class="form-control" id="f-status">
          <option value="active" ${user?.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${user?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    `;
    const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">${isEdit ? 'Save' : 'Add User'}</button>`;
    const overlay = openModal({ title: isEdit ? 'Edit User' : 'Add User', body, footer });
    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const name = overlay.querySelector('#f-name').value.trim();
      const email = overlay.querySelector('#f-email').value.trim();
      if (!name || !email) { toast({ title: 'Please fill required fields', variant: 'error' }); return; }
      const data = {
        full_name: name,
        email,
        role: overlay.querySelector('#f-role').value,
        branch_id: Number(overlay.querySelector('#f-branch').value),
        status: overlay.querySelector('#f-status').value,
      };
      if (!isEdit) data.password = overlay.querySelector('#f-password').value;
      const res = isEdit ? await UsersService.update(user.id, data) : await UsersService.create(data);
      if (res.error) { toast({ title: 'Error', description: res.error, variant: 'error' }); return; }
      toast({ title: isEdit ? 'User updated' : 'User added', variant: 'success' });
      closeModal(); render(container);
    });
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  return { render };
})();

window.loadUsers = (container) => UsersPage.render(container);
