/* ============================================================
   GymPro - Payments Page
   Full CRUD, search, filter, sort, pagination, modal forms.
   ============================================================ */
const PaymentsPage = (() => {
  const { icon, esc, money, openModal, closeModal, confirmDialog, toast, exportCSV, date } = window.GymProUtils;

  let state = { page: 1, pageSize: 10, search: '', sortField: 'date', sortDir: 'desc', filterStatus: '', filterMethod: '' };

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function loadMembers() {
    const res = await MembersService.list({ page: 1, pageSize: 200 });
    return res.data.items || [];
  }
  async function loadPlans() {
    const res = await PlansService.list();
    return res.data.items || [];
  }

  async function render(container) {
    const [members, plans] = await Promise.all([loadMembers(), loadPlans()]);
    const opts = {
      page: state.page, pageSize: state.pageSize, search: state.search,
      searchFields: ['member_name', 'reference', 'plan_name'], sort: { field: state.sortField, dir: state.sortDir }, filters: {},
    };
    if (state.filterStatus) opts.filters.status = state.filterStatus;
    if (state.filterMethod) opts.filters.method = state.filterMethod;
    const res = await PaymentsService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    const methods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Payment'];

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Payments</h1>
            <p>${num(total)} payment records</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-export">${icon('download')} Export</button>
            <button class="btn btn-primary" id="btn-add">${icon('plus')} Record Payment</button>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box" style="width:260px">
                  ${icon('search')}
                  <input type="text" id="pay-search" placeholder="Search payments..." value="${esc(state.search)}" />
                </div>
                <select class="form-control filter-select" id="filter-status">
                  <option value="">All Status</option>
                  <option value="completed" ${state.filterStatus === 'completed' ? 'selected' : ''}>Completed</option>
                  <option value="pending" ${state.filterStatus === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="failed" ${state.filterStatus === 'failed' ? 'selected' : ''}>Failed</option>
                </select>
                <select class="form-control filter-select" id="filter-method">
                  <option value="">All Methods</option>
                  ${methods.map((m) => `<option value="${m}" ${state.filterMethod === m ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
              </div>
              <div class="toolbar-right"><span style="font-size:0.875rem;color:#64748b">${total} results</span></div>
            </div>
            <div class="table-wrap">
              <table class="table responsive-table">
                <thead><tr>
                  <th data-sort="reference">Reference</th>
                  <th data-sort="member_name">Member</th>
                  <th data-sort="plan_name">Plan</th>
                  <th data-sort="amount">Amount</th>
                  <th data-sort="method">Method</th>
                  <th data-sort="status">Status</th>
                  <th data-sort="date">Date</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  ${items.map((p) => `
                    <tr>
                      <td data-label="Reference"><span style="font-size:0.8125rem;color:#64748b">${esc(p.reference)}</span></td>
                      <td data-label="Member"><strong style="color:#1e293b">${esc(p.member_name)}</strong></td>
                      <td data-label="Plan">${esc(p.plan_name)}</td>
                      <td data-label="Amount"><strong>${money(p.amount)}</strong></td>
                      <td data-label="Method">${esc(p.method)}</td>
                      <td data-label="Status"><span class="badge ${p.status === 'completed' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-danger'}">${esc(p.status)}</span></td>
                      <td data-label="Date">${date(p.date)}</td>
                      <td data-label="" style="text-align:right">
                        <button class="btn-icon btn-edit" data-id="${p.id}">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${p.id}">${icon('trash')}</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No payments found</div>' : ''}
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
    setupEvents(container, members, plans, methods);
  }

  function setupEvents(container, members, plans, methods) {
    container.querySelector('#btn-add').addEventListener('click', () => buildForm(null, members, plans, methods));
    container.querySelector('#btn-export').addEventListener('click', () => {
      PaymentsService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('payments.csv', res.data.items.map((p) => ({ Reference: p.reference, Member: p.member_name, Plan: p.plan_name, Amount: p.amount, Method: p.method, Status: p.status, Date: p.date })));
      });
    });
    container.querySelector('#pay-search').addEventListener('input', debounce((e) => { state.search = e.target.value; state.page = 1; render(container); }, 300));
    container.querySelector('#filter-status').addEventListener('change', (e) => { state.filterStatus = e.target.value; state.page = 1; render(container); });
    container.querySelector('#filter-method').addEventListener('change', (e) => { state.filterMethod = e.target.value; state.page = 1; render(container); });
    container.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
      const f = th.dataset.sort;
      if (state.sortField === f) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortField = f; state.sortDir = 'asc'; }
      render(container);
    }));
    container.querySelector('#prev-page').addEventListener('click', () => { if (state.page > 1) { state.page--; render(container); } });
    container.querySelector('#next-page').addEventListener('click', () => { state.page++; render(container); });
    container.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => buildForm(btn.dataset.id, members, plans, methods)));
    container.querySelectorAll('.btn-del').forEach((btn) => btn.addEventListener('click', () => {
      confirmDialog({ title: 'Delete payment', message: 'Delete this payment record?', onConfirm: async () => {
        await PaymentsService.remove(btn.dataset.id);
        toast({ title: 'Payment deleted', variant: 'success' });
        render(container);
      }});
    }));
  }

  function buildForm(id, members, plans, methods) {
    if (id) { PaymentsService.get(id).then((r) => r.data && buildModal(r.data, members, plans, methods)); }
    else buildModal(null, members, plans, methods);
  }

  function buildModal(pay, members, plans, methods) {
    const isEdit = !!pay;
    const body = `
      <div class="form-group"><label class="form-label">Member</label>
        <select class="form-control" id="f-member">${members.map((m) => `<option value="${m.id}" ${String(pay?.member_id) === String(m.id) ? 'selected' : ''}>${esc(m.full_name)}</option>`).join('')}</select>
      </div>
      <div class="form-group"><label class="form-label">Plan</label>
        <select class="form-control" id="f-plan">${plans.map((p) => `<option value="${p.id}" data-price="${p.price}" ${pay?.plan_name === p.name ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Amount ($) *</label><input class="form-control" id="f-amount" type="number" step="0.01" value="${pay?.amount || ''}" required /></div>
        <div class="form-group"><label class="form-label">Method</label>
          <select class="form-control" id="f-method">${methods.map((m) => `<option value="${m}" ${pay?.method === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-control" id="f-status">
            <option value="completed" ${pay?.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="pending" ${pay?.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="failed" ${pay?.status === 'failed' ? 'selected' : ''}>Failed</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Date</label><input class="form-control" id="f-date" type="date" value="${pay?.date || new Date().toISOString().slice(0, 10)}" /></div>
      </div>
    `;
    const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">${isEdit ? 'Save' : 'Record Payment'}</button>`;
    const overlay = openModal({ title: isEdit ? 'Edit Payment' : 'Record Payment', body, footer });

    // Auto set amount from plan price
    const planSelect = overlay.querySelector('#f-plan');
    const amountInput = overlay.querySelector('#f-amount');
    planSelect.addEventListener('change', () => {
      const opt = planSelect.options[planSelect.selectedIndex];
      if (opt.dataset.price) amountInput.value = opt.dataset.price;
    });

    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const amount = parseFloat(amountInput.value);
      if (isNaN(amount)) { toast({ title: 'Please enter a valid amount', variant: 'error' }); return; }
      const planOpt = planSelect.options[planSelect.selectedIndex];
      const data = {
        member_id: Number(overlay.querySelector('#f-member').value) || null,
        member_name: members.find((m) => String(m.id) === String(overlay.querySelector('#f-member').value))?.full_name || 'Walk-in',
        plan_name: planOpt.textContent,
        amount,
        method: overlay.querySelector('#f-method').value,
        status: overlay.querySelector('#f-status').value,
        date: overlay.querySelector('#f-date').value,
      };
      if (isEdit) { await PaymentsService.update(pay.id, data); toast({ title: 'Payment updated', variant: 'success' }); }
      else { await PaymentsService.create(data); toast({ title: 'Payment recorded', variant: 'success' }); }
      closeModal(); render(container);
    });
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  return { render };
})();

window.loadPayments = (container) => PaymentsPage.render(container);
