/* ============================================================
   GymPro - Nutrition Plans Page
   Full CRUD, search, sort, pagination, modal forms.
   ============================================================ */
const NutritionPlansPage = (() => {
  const { icon, esc, openModal, closeModal, confirmDialog, toast, exportCSV } = window.GymProUtils;

  let state = { page: 1, pageSize: 10, search: '', sortField: 'name', sortDir: 'asc' };

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function render(container) {
    const opts = {
      page: state.page, pageSize: state.pageSize, search: state.search,
      searchFields: ['name'], sort: { field: state.sortField, dir: state.sortDir },
    };
    const res = await NutritionService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Nutrition Plans</h1>
            <p>${num(total)} meal plans</p>
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
                  <input type="text" id="nutrition-search" placeholder="Search plans..." value="${esc(state.search)}" />
                </div>
              </div>
              <div class="toolbar-right"><span style="font-size:0.875rem;color:#64748b">${total} results</span></div>
            </div>
            <div class="table-wrap">
              <table class="table responsive-table">
                <thead><tr>
                  <th data-sort="name">Plan</th>
                  <th data-sort="calories">Calories</th>
                  <th>Macros (P/C/F)</th>
                  <th data-sort="duration_weeks">Duration</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  ${items.map((n) => `
                    <tr>
                      <td data-label="Plan">
                        <strong style="color:#1e293b">${esc(n.name)}</strong>
                        <div style="font-size:0.75rem;color:#64748b">${esc(n.description)}</div>
                      </td>
                      <td data-label="Calories"><strong>${num(n.calories)}</strong> kcal</td>
                      <td data-label="Macros"><span style="font-size:0.8125rem">${n.protein}g / ${n.carbs}g / ${n.fats}g</span></td>
                      <td data-label="Duration">${n.duration_weeks} weeks</td>
                      <td data-label="" style="text-align:right">
                        <button class="btn-icon btn-edit" data-id="${n.id}">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${n.id}">${icon('trash')}</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No nutrition plans found</div>' : ''}
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
      NutritionService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('nutrition-plans.csv', res.data.items.map((n) => ({ Name: n.name, Calories: n.calories, Protein: n.protein, Carbs: n.carbs, Fats: n.fats, Duration: n.duration_weeks + 'w' })));
      });
    });
    container.querySelector('#nutrition-search').addEventListener('input', debounce((e) => { state.search = e.target.value; state.page = 1; render(container); }, 300));
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
      confirmDialog({ title: 'Delete plan', message: 'Delete this nutrition plan?', onConfirm: async () => {
        await NutritionService.remove(btn.dataset.id);
        toast({ title: 'Plan deleted', variant: 'success' });
        render(container);
      }});
    }));
  }

  function buildForm(id) {
    if (id) { NutritionService.get(id).then((r) => r.data && buildModal(r.data)); }
    else buildModal(null);
  }

  function buildModal(plan) {
    const isEdit = !!plan;
    const body = `
      <div class="form-group"><label class="form-label">Plan Name *</label><input class="form-control" id="f-name" value="${esc(plan?.name || '')}" required /></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" id="f-desc" rows="2">${esc(plan?.description || '')}</textarea></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Calories (kcal)</label><input class="form-control" id="f-cal" type="number" value="${plan?.calories || 2000}" /></div>
        <div class="form-group"><label class="form-label">Duration (weeks)</label><input class="form-control" id="f-duration" type="number" value="${plan?.duration_weeks || 4}" /></div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Protein (g)</label><input class="form-control" id="f-protein" type="number" value="${plan?.protein || 100}" /></div>
        <div class="form-group"><label class="form-label">Carbs (g)</label><input class="form-control" id="f-carbs" type="number" value="${plan?.carbs || 200}" /></div>
      </div>
      <div class="form-group"><label class="form-label">Fats (g)</label><input class="form-control" id="f-fats" type="number" value="${plan?.fats || 60}" /></div>
    `;
    const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">${isEdit ? 'Save' : 'Add Plan'}</button>`;
    const overlay = openModal({ title: isEdit ? 'Edit Plan' : 'Add Nutrition Plan', body, footer });
    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const name = overlay.querySelector('#f-name').value.trim();
      if (!name) { toast({ title: 'Please enter a plan name', variant: 'error' }); return; }
      const data = {
        name,
        description: overlay.querySelector('#f-desc').value,
        calories: parseInt(overlay.querySelector('#f-cal').value) || 2000,
        duration_weeks: parseInt(overlay.querySelector('#f-duration').value) || 4,
        protein: parseInt(overlay.querySelector('#f-protein').value) || 100,
        carbs: parseInt(overlay.querySelector('#f-carbs').value) || 200,
        fats: parseInt(overlay.querySelector('#f-fats').value) || 60,
      };
      if (isEdit) { await NutritionService.update(plan.id, data); toast({ title: 'Plan updated', variant: 'success' }); }
      else { await NutritionService.create(data); toast({ title: 'Plan added', variant: 'success' }); }
      closeModal(); render(container);
    });
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  return { render };
})();

window.loadNutritionPlans = (container) => NutritionPlansPage.render(container);
