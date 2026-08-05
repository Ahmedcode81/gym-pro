/* ============================================================
   GymPro - Inventory Page
   Full CRUD, search, filter, sort, pagination, stock adjustments.
   ============================================================ */
const InventoryPage = (() => {
  const { icon, esc, money, openModal, closeModal, confirmDialog, toast, exportCSV } = window.GymProUtils;

  let state = { page: 1, pageSize: 10, search: '', sortField: 'name', sortDir: 'asc', filterStatus: '', filterCategory: '' };

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function loadBranches() {
    const res = await BranchesService.list();
    return res.data.items || [];
  }

  async function render(container) {
    const branches = await loadBranches();
    const opts = {
      page: state.page, pageSize: state.pageSize, search: state.search,
      searchFields: ['name', 'sku', 'category'], sort: { field: state.sortField, dir: state.sortDir }, filters: {},
    };
    if (state.filterStatus) opts.filters.status = state.filterStatus;
    if (state.filterCategory) opts.filters.category = state.filterCategory;
    const res = await InventoryService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    const categories = ['Supplements', 'Accessories', 'Apparel', 'Equipment', 'Nutrition'];

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Inventory</h1>
            <p>${num(total)} products</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-export">${icon('download')} Export</button>
            <button class="btn btn-primary" id="btn-add">${icon('plus')} Add Item</button>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box" style="width:260px">
                  ${icon('search')}
                  <input type="text" id="inv-search" placeholder="Search inventory..." value="${esc(state.search)}" />
                </div>
                <select class="form-control filter-select" id="filter-status">
                  <option value="">All Status</option>
                  <option value="in_stock" ${state.filterStatus === 'in_stock' ? 'selected' : ''}>In Stock</option>
                  <option value="low_stock" ${state.filterStatus === 'low_stock' ? 'selected' : ''}>Low Stock</option>
                  <option value="out_of_stock" ${state.filterStatus === 'out_of_stock' ? 'selected' : ''}>Out of Stock</option>
                </select>
                <select class="form-control filter-select" id="filter-category">
                  <option value="">All Categories</option>
                  ${categories.map((c) => `<option value="${c}" ${state.filterCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
              <div class="toolbar-right"><span style="font-size:0.875rem;color:#64748b">${total} results</span></div>
            </div>
            <div class="table-wrap">
              <table class="table responsive-table">
                <thead><tr>
                  <th data-sort="name">Item</th>
                  <th data-sort="category">Category</th>
                  <th data-sort="price">Price</th>
                  <th data-sort="quantity">Stock</th>
                  <th data-sort="status">Status</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  ${items.map((i) => {
                    const statusBadge = i.status === 'in_stock' ? 'badge-success' : i.status === 'low_stock' ? 'badge-warning' : 'badge-danger';
                    return `<tr>
                      <td data-label="Item">
                        <strong style="color:#1e293b">${esc(i.name)}</strong>
                        <div style="font-size:0.75rem;color:#64748b">${esc(i.sku)}</div>
                      </td>
                      <td data-label="Category"><span class="badge badge-info">${esc(i.category)}</span></td>
                      <td data-label="Price">${money(i.price)}</td>
                      <td data-label="Stock">
                        <div style="display:flex;align-items:center;gap:8px">
                          <button class="btn btn-sm btn-outline" data-dec="${i.id}">−</button>
                          <strong>${num(i.quantity)}</strong>
                          <button class="btn btn-sm btn-outline" data-inc="${i.id}">+</button>
                        </div>
                      </td>
                      <td data-label="Status"><span class="badge ${statusBadge}">${esc(i.status)}</span></td>
                      <td data-label="" style="text-align:right">
                        <button class="btn-icon btn-edit" data-id="${i.id}">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${i.id}">${icon('trash')}</button>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No inventory items found</div>' : ''}
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
    setupEvents(container, branches, categories);
  }

  function setupEvents(container, branches, categories) {
    container.querySelector('#btn-add').addEventListener('click', () => buildForm(null, branches, categories));
    container.querySelector('#btn-export').addEventListener('click', () => {
      InventoryService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('inventory.csv', res.data.items.map((i) => ({ Name: i.name, SKU: i.sku, Category: i.category, Price: i.price, Quantity: i.quantity, Status: i.status })));
      });
    });
    container.querySelector('#inv-search').addEventListener('input', debounce((e) => { state.search = e.target.value; state.page = 1; render(container); }, 300));
    container.querySelector('#filter-status').addEventListener('change', (e) => { state.filterStatus = e.target.value; state.page = 1; render(container); });
    container.querySelector('#filter-category').addEventListener('change', (e) => { state.filterCategory = e.target.value; state.page = 1; render(container); });
    container.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
      const f = th.dataset.sort;
      if (state.sortField === f) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortField = f; state.sortDir = 'asc'; }
      render(container);
    }));
    container.querySelector('#prev-page').addEventListener('click', () => { if (state.page > 1) { state.page--; render(container); } });
    container.querySelector('#next-page').addEventListener('click', () => { state.page++; render(container); });
    container.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => buildForm(btn.dataset.id, branches, categories)));
    container.querySelectorAll('.btn-del').forEach((btn) => btn.addEventListener('click', () => {
      confirmDialog({ title: 'Delete item', message: 'Delete this inventory item?', onConfirm: async () => {
        await InventoryService.remove(btn.dataset.id);
        toast({ title: 'Item deleted', variant: 'success' });
        render(container);
      }});
    }));
    // Stock adjust
    container.querySelectorAll('[data-inc]').forEach((btn) => btn.addEventListener('click', async () => {
      await InventoryService.adjustStock(btn.dataset.inc, 1);
      render(container);
    }));
    container.querySelectorAll('[data-dec]').forEach((btn) => btn.addEventListener('click', async () => {
      await InventoryService.adjustStock(btn.dataset.dec, -1);
      render(container);
    }));
  }

  function buildForm(id, branches, categories) {
    if (id) { InventoryService.get(id).then((r) => r.data && buildModal(r.data, branches, categories)); }
    else buildModal(null, branches, categories);
  }

  function buildModal(item, branches, categories) {
    const isEdit = !!item;
    const body = `
      <div class="form-group"><label class="form-label">Item Name *</label><input class="form-control" id="f-name" value="${esc(item?.name || '')}" required /></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Category</label>
          <select class="form-control" id="f-category">${categories.map((c) => `<option value="${c}" ${item?.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">SKU</label><input class="form-control" id="f-sku" value="${esc(item?.sku || '')}" /></div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Price ($)</label><input class="form-control" id="f-price" type="number" step="0.01" value="${item?.price || ''}" /></div>
        <div class="form-group"><label class="form-label">Cost ($)</label><input class="form-control" id="f-cost" type="number" step="0.01" value="${item?.cost || ''}" /></div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Quantity</label><input class="form-control" id="f-qty" type="number" value="${item?.quantity || 0}" /></div>
        <div class="form-group"><label class="form-label">Reorder Level</label><input class="form-control" id="f-reorder" type="number" value="${item?.reorder_level || 10}" /></div>
      </div>
      <div class="form-group"><label class="form-label">Supplier</label><input class="form-control" id="f-supplier" value="${esc(item?.supplier || '')}" /></div>
    `;
    const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">${isEdit ? 'Save' : 'Add Item'}</button>`;
    const overlay = openModal({ title: isEdit ? 'Edit Item' : 'Add Inventory Item', body, footer });
    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const name = overlay.querySelector('#f-name').value.trim();
      if (!name) { toast({ title: 'Please enter an item name', variant: 'error' }); return; }
      const data = {
        name,
        category: overlay.querySelector('#f-category').value,
        sku: overlay.querySelector('#f-sku').value,
        price: parseFloat(overlay.querySelector('#f-price').value) || 0,
        cost: parseFloat(overlay.querySelector('#f-cost').value) || 0,
        quantity: parseInt(overlay.querySelector('#f-qty').value) || 0,
        reorder_level: parseInt(overlay.querySelector('#f-reorder').value) || 10,
        supplier: overlay.querySelector('#f-supplier').value,
      };
      if (isEdit) { await InventoryService.update(item.id, data); toast({ title: 'Item updated', variant: 'success' }); }
      else { await InventoryService.create(data); toast({ title: 'Item added', variant: 'success' }); }
      closeModal(); render(container);
    });
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  return { render };
})();

window.loadInventory = (container) => InventoryPage.render(container);
