/* ============================================================
   GymPro - Workout Programs Page
   Full CRUD, search, filter, sort, pagination, modal forms.
   ============================================================ */
const WorkoutProgramsPage = (() => {
  const { icon, esc, openModal, closeModal, confirmDialog, toast, exportCSV } = window.GymProUtils;

  let state = { page: 1, pageSize: 10, search: '', sortField: 'name', sortDir: 'asc', filterDifficulty: '' };

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function loadTrainers() {
    const res = await TrainersService.list({ page: 1, pageSize: 100 });
    return res.data.items || [];
  }

  async function render(container) {
    const trainers = await loadTrainers();
    const opts = {
      page: state.page, pageSize: state.pageSize, search: state.search,
      searchFields: ['name', 'description'], sort: { field: state.sortField, dir: state.sortDir }, filters: {},
    };
    if (state.filterDifficulty) opts.filters.difficulty = state.filterDifficulty;
    const res = await WorkoutService.list(opts);
    const { items, total } = res.data;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Workout Programs</h1>
            <p>${num(total)} training programs</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-export">${icon('download')} Export</button>
            <button class="btn btn-primary" id="btn-add">${icon('plus')} Add Program</button>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="toolbar">
              <div class="toolbar-left">
                <div class="search-box" style="width:260px">
                  ${icon('search')}
                  <input type="text" id="wo-search" placeholder="Search programs..." value="${esc(state.search)}" />
                </div>
                <select class="form-control filter-select" id="filter-difficulty">
                  <option value="">All Levels</option>
                  <option value="Beginner" ${state.filterDifficulty === 'Beginner' ? 'selected' : ''}>Beginner</option>
                  <option value="Intermediate" ${state.filterDifficulty === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                  <option value="Advanced" ${state.filterDifficulty === 'Advanced' ? 'selected' : ''}>Advanced</option>
                </select>
              </div>
              <div class="toolbar-right"><span style="font-size:0.875rem;color:#64748b">${total} results</span></div>
            </div>
            <div class="table-wrap">
              <table class="table responsive-table">
                <thead><tr>
                  <th data-sort="name">Program</th>
                  <th data-sort="difficulty">Level</th>
                  <th data-sort="duration_weeks">Duration</th>
                  <th data-sort="sessions_per_week">Sessions/Week</th>
                  <th data-sort="trainer_id">Trainer</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  ${items.map((w) => {
                    const trainer = trainers.find((t) => String(t.id) === String(w.trainer_id));
                    return `<tr>
                      <td data-label="Program">
                        <div style="font-weight:600;color:#1e293b">${esc(w.name)}</div>
                        <div style="font-size:0.75rem;color:#64748b">${esc(w.description || '')}</div>
                      </td>
                      <td data-label="Level"><span class="badge ${w.difficulty === 'Beginner' ? 'badge-success' : w.difficulty === 'Intermediate' ? 'badge-warning' : 'badge-danger'}">${esc(w.difficulty)}</span></td>
                      <td data-label="Duration">${w.duration_weeks} weeks</td>
                      <td data-label="Sessions">${w.sessions_per_week}×/week</td>
                      <td data-label="Trainer">${esc(trainer ? trainer.full_name : '—')}</td>
                      <td data-label="" style="text-align:right">
                        <button class="btn-icon btn-edit" data-id="${w.id}">${icon('pencil')}</button>
                        <button class="btn-icon btn-icon-danger btn-del" data-id="${w.id}">${icon('trash')}</button>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
              ${items.length === 0 ? '<div class="empty-state">No programs found</div>' : ''}
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
    setupEvents(container, trainers);
  }

  function setupEvents(container, trainers) {
    container.querySelector('#btn-add').addEventListener('click', () => buildForm(null, trainers));
    container.querySelector('#btn-export').addEventListener('click', () => {
      WorkoutService.list({ page: 1, pageSize: 1000 }).then((res) => {
        exportCSV('workout-programs.csv', res.data.items.map((w) => ({ Name: w.name, Level: w.difficulty, Duration: w.duration_weeks + 'w', Sessions: w.sessions_per_week })));
      });
    });
    container.querySelector('#wo-search').addEventListener('input', debounce((e) => { state.search = e.target.value; state.page = 1; render(container); }, 300));
    container.querySelector('#filter-difficulty').addEventListener('change', (e) => { state.filterDifficulty = e.target.value; state.page = 1; render(container); });
    container.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
      const f = th.dataset.sort;
      if (state.sortField === f) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortField = f; state.sortDir = 'asc'; }
      render(container);
    }));
    container.querySelector('#prev-page').addEventListener('click', () => { if (state.page > 1) { state.page--; render(container); } });
    container.querySelector('#next-page').addEventListener('click', () => { state.page++; render(container); });
    container.querySelectorAll('.btn-edit').forEach((btn) => btn.addEventListener('click', () => buildForm(btn.dataset.id, trainers)));
    container.querySelectorAll('.btn-del').forEach((btn) => btn.addEventListener('click', () => {
      confirmDialog({ title: 'Delete program', message: 'Delete this workout program?', onConfirm: async () => {
        await WorkoutService.remove(btn.dataset.id);
        toast({ title: 'Program deleted', variant: 'success' });
        render(container);
      }});
    }));
  }

  function buildForm(id, trainers) {
    if (id) { WorkoutService.get(id).then((r) => r.data && buildModal(r.data, trainers)); }
    else buildModal(null, trainers);
  }

  function buildModal(program, trainers) {
    const isEdit = !!program;
    const body = `
      <div class="form-group"><label class="form-label">Program Name *</label><input class="form-control" id="f-name" value="${esc(program?.name || '')}" required /></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" id="f-desc" rows="2">${esc(program?.description || '')}</textarea></div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Difficulty</label>
          <select class="form-control" id="f-difficulty">
            <option value="Beginner" ${program?.difficulty === 'Beginner' ? 'selected' : ''}>Beginner</option>
            <option value="Intermediate" ${program?.difficulty === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="Advanced" ${program?.difficulty === 'Advanced' ? 'selected' : ''}>Advanced</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Trainer</label>
          <select class="form-control" id="f-trainer">${trainers.map((t) => `<option value="${t.id}" ${String(program?.trainer_id) === String(t.id) ? 'selected' : ''}>${esc(t.full_name)}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Duration (weeks)</label><input class="form-control" id="f-duration" type="number" value="${program?.duration_weeks || 4}" /></div>
        <div class="form-group"><label class="form-label">Sessions / Week</label><input class="form-control" id="f-sessions" type="number" value="${program?.sessions_per_week || 3}" /></div>
      </div>
    `;
    const footer = `<button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">${isEdit ? 'Save' : 'Add Program'}</button>`;
    const overlay = openModal({ title: isEdit ? 'Edit Program' : 'Add Workout Program', body, footer });
    overlay.querySelector('#f-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#f-save').addEventListener('click', async () => {
      const name = overlay.querySelector('#f-name').value.trim();
      if (!name) { toast({ title: 'Please enter a program name', variant: 'error' }); return; }
      const data = {
        name,
        description: overlay.querySelector('#f-desc').value,
        difficulty: overlay.querySelector('#f-difficulty').value,
        trainer_id: Number(overlay.querySelector('#f-trainer').value),
        duration_weeks: parseInt(overlay.querySelector('#f-duration').value) || 4,
        sessions_per_week: parseInt(overlay.querySelector('#f-sessions').value) || 3,
      };
      if (isEdit) { await WorkoutService.update(program.id, data); toast({ title: 'Program updated', variant: 'success' }); }
      else { await WorkoutService.create(data); toast({ title: 'Program added', variant: 'success' }); }
      closeModal(); render(container);
    });
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  return { render };
})();

window.loadWorkoutPrograms = (container) => WorkoutProgramsPage.render(container);
