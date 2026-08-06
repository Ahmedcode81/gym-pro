/* ============================================================
   GymPro - Members Page
   Full CRUD, search, filters, sort, pagination, modal forms.
   ============================================================ */
const MembersPage = (() => {
  const { icon, esc, initials, money, date, avatarColor, openModal, closeModal, confirmDialog, toast, exportCSV, sortBy } = window.GymProUtils;

  let state = {
    page: 1,
    pageSize: 10,
    search: '',
    sortField: 'full_name',
    sortDir: 'asc',
    filterStatus: '',
    filterBranch: '',
  };

  async function loadPlans() {
    const res = await PlansService.list();
    return res.data.items || [];
  }

  async function loadBranches() {
    const res = await (window.BranchesService ? BranchesService.list() : GymProApi.request(() => GymProDB.all('branches')));
    return res.data.items || res.data || [];
  }

  async function render(container) {
    const [plans, branches] = await Promise.all([loadPlans(), loadBranches()]);
    const opts = {
      page: state.page,
      pageSize: state.pageSize,
      search: state.search,
      searchFields: ['full_name', 'email', 'phone'],
      sort: { field: state.sortField, dir: state.sortDir },
      filters: {},
    };
    if (state.filterStatus) opts.filters.membership_status = state.filterStatus;
    if (state.filterBranch) opts.filters.branch_id = String(state.filterBranch);

    const res = await MembersService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Members</h1>
            <p>${num(total)} registered members</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-export">${icon('download')} Export</button>
            <button class="btn btn-primary" id="btn-add">${icon('plus')} Add Member</button>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box" style="width:260px">
                  ${icon('search')}
                  <input type="text" id="member-search" placeholder="Search members..." value="${esc(state.search)}" />
                </div>
                <select class="form-control filter-select" id="filter-status">
                  <option value="">All Status</option>
                  <option value="active" ${state.filterStatus === 'active' ? 'selected' : ''}>Active</option>
                  <option value="expired" ${state.filterStatus === 'expired' ? 'selected' : ''}>Expired</option>
                  <option value="pending" ${state.filterStatus === 'pending' ? 'selected' : ''}>Pending</option>
                </select>
                <select class="form-control filter-select" id="filter-branch">
                  <option value="">All Branches</option>
                  ${branches.map((b) => `<option value="${b.id}" ${String(state.filterBranch) === String(b.id) ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}
                </select>
              </div>
              <div class="toolbar-right">
                <span style="font-size:0.875rem;color:#64748b">${total} results</span>
              </div>
            </div>

            <div class="table-wrap">
              <table class="table responsive-table">
                <thead>
                  <tr>
                    <th data-sort="full_name">Member</th>
                    <th data-sort="plan_id">Plan</th>
                    <th data-sort="membership_status">Status</th>
                    <th data-sort="branch_id">Branch</th>
                    <th data-sort="join_date">Joined</th>
                    <th data-sort="expiry">Expires</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="member-tbody">
                  ${items.map((m) => {
                    const plan = plans.find((p) => String(p.id) === String(m.plan_id));
                    const branch = branches.find((b) => String(b.id) === String(m.branch_id));
                    const statusBadge = m.membership_status === 'active' ? 'badge-success' : m.membership_status === 'expired' ? 'badge-danger' : 'badge-warning';
                    return `<tr>
                      <td data-label="Member">
                        <div style="display:flex;align-items:center;gap:12px">
                          <div class="avatar ${avatarColor(m.full_name)}">${initials(m.full_name)}</div>
                          <div>
                            <div style="font-weight:600;color:#1e293b">${esc(m.full_name)}</div>
                            <div style="font-size:0.75rem;color:#64748b">${esc(m.email)}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Plan">${esc(plan ? plan.name : '—')}</td>
                      <td data-label="Status"><span class="badge ${statusBadge}">${esc(m.membership_status)}</span></td>
                      <td data-label="Branch">${esc(branch ? branch.name : '—')}</td>
                      <td data-label="Joined">${date(m.join_date)}</td>
                      <td data-label="Expires">${date(m.membership_expiry)}</td>
                      <td data-label="" style="text-align:right">
                        <button class="btn-icon btn-edit" data-id="${m.id}" aria-label="Edit">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${m.id}" aria-label="Delete">${icon('trash')}</button>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No members found</div>' : ''}
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

    // Events
    setupEvents(container, plans, branches);
  }

  function num(n) { return Number(n || 0).toLocaleString(); }

  function setupEvents(container, plans, branches) {
    container.querySelector('#btn-add').addEventListener('click', () => openForm(null, plans, branches));
    container.querySelector('#btn-export').addEventListener('click', () => {
      MembersService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('members.csv', res.data.items.map((m) => ({
          Name: m.full_name, Email: m.email, Phone: m.phone, Status: m.membership_status, Branch: branches.find((b) => String(b.id) === String(m.branch_id))?.name || '', Joined: m.join_date,
        })));
      });
    });

    container.querySelector('#member-search').addEventListener('input', debounce((e) => {
      state.search = e.target.value;
      state.page = 1;
      render(container);
    }, 300));
    container.querySelector('#filter-status').addEventListener('change', (e) => {
      state.filterStatus = e.target.value;
      state.page = 1;
      render(container);
    });
    container.querySelector('#filter-branch').addEventListener('change', (e) => {
      state.filterBranch = e.target.value;
      state.page = 1;
      render(container);
    });

    container.querySelectorAll('th[data-sort]').forEach((th) => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (state.sortField === field) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        else { state.sortField = field; state.sortDir = 'asc'; }
        render(container);
      });
    });

    container.querySelector('#prev-page').addEventListener('click', () => {
      if (state.page > 1) { state.page--; render(container); }
    });
    container.querySelector('#next-page').addEventListener('click', () => {
      state.page++; render(container);
    });

    container.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => openForm(btn.dataset.id, plans, branches));
    });
    container.querySelectorAll('.btn-del').forEach((btn) => {
      btn.addEventListener('click', () => {
        confirmDialog({
          title: 'Delete member',
          message: 'Are you sure you want to delete this member?',
          onConfirm: async () => {
            await MembersService.remove(btn.dataset.id);
            toast({ title: 'Member deleted', variant: 'success' });
            render(container);
          },
        });
      });
    });
  }

  function openForm(id, plans, branches) {
    // Load member if editing
    if (id) {
      MembersService.get(id).then((res) => {
        if (res.data) buildForm(res.data, plans, branches);
      });
    } else {
      buildForm(null, plans, branches);
    }
  }

  function buildForm(member, plans, branches) {
    const isEdit = !!member;
    const body = `
      <div class="form-group">
        <label class="form-label">Full Name *</label>
        <input class="form-control" id="f-name" value="${esc(member?.full_name || '')}" required />
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input class="form-control" id="f-email" type="email" value="${esc(member?.email || '')}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input class="form-control" id="f-phone" value="${esc(member?.phone || '')}" />
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Gender</label>
          <select class="form-control" id="f-gender">
            <option value="male" ${member?.gender === 'male' ? 'selected' : ''}>Male</option>
            <option value="female" ${member?.gender === 'female' ? 'selected' : ''}>Female</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Birth Date</label>
          <input class="form-control" id="f-birth" type="date" value="${member?.birth_date?.slice(0, 10) || ''}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Address</label>
        <input class="form-control" id="f-address" value="${esc(member?.address || '')}" />
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Membership Plan</label>
          <select class="form-control" id="f-plan">
            ${plans.map((p) => `<option value="${p.id}" ${String(member?.plan_id) === String(p.id) ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Branch</label>
          <select class="form-control" id="f-branch">
            ${branches.map((b) => `<option value="${b.id}" ${String(member?.branch_id) === String(b.id) ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-control" id="f-status">
          <option value="active" ${member?.membership_status === 'active' ? 'selected' : ''}>Active</option>
          <option value="expired" ${member?.membership_status === 'expired' ? 'selected' : ''}>Expired</option>
          <option value="pending" ${member?.membership_status === 'pending' ? 'selected' : ''}>Pending</option>
        </select>
      </div>
    `;
    const footer = `
      <button class="btn btn-outline" id="f-cancel">Cancel</button>
      <button class="btn btn-primary" id="f-save">${isEdit ? 'Save Changes' : 'Add Member'}</button>
    `;
    const overlay = openModal({ title: isEdit ? 'Edit Member' : 'Add New Member', body, footer, size: 'lg' });

    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const name = overlay.querySelector('#f-name').value.trim();
      const email = overlay.querySelector('#f-email').value.trim();
      if (!name || !email) {
        toast({ title: 'Please fill required fields', variant: 'error' });
        return;
      }
      const data = {
        full_name: name,
        email,
        phone: overlay.querySelector('#f-phone').value,
        gender: overlay.querySelector('#f-gender').value,
        birth_date: overlay.querySelector('#f-birth').value,
        address: overlay.querySelector('#f-address').value,
        plan_id: Number(overlay.querySelector('#f-plan').value),
        branch_id: Number(overlay.querySelector('#f-branch').value),
        membership_status: overlay.querySelector('#f-status').value,
      };
      try {
        if (isEdit) {
          await MembersService.update(member.id, data);
          toast({ title: 'Member updated', variant: 'success' });
        } else {
          await MembersService.create(data);
          toast({ title: 'Member added', variant: 'success' });
        }
        closeModal();
        render(container);
      } catch (e) {
        toast({ title: 'Error', description: e.message, variant: 'error' });
      }
    });
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  return { render };
})();

window.loadMembers = (container) => MembersPage.render(container);
