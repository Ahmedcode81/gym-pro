/* ============================================================
   GymPro - Settings Page
   Gym info, currency, timezone, language, reset demo data.
   ============================================================ */
const SettingsPage = (() => {
  const { icon, esc, openModal, closeModal, confirmDialog, toast } = window.GymProUtils;

  async function render(container) {
    const res = await SettingsService.get();
    const settings = res.data;

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Settings</h1>
            <p>Manage your gym configuration</p>
          </div>
        </div>

        <div class="grid grid-2" style="margin-bottom:24px">
          <div class="card">
            <div class="card-header"><h3>Gym Information</h3></div>
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Gym Name</label>
                <input class="form-control" id="s-name" value="${esc(settings.gym_name)}" />
              </div>
              <div class="form-group">
                <label class="form-label">Currency</label>
                <select class="form-control" id="s-currency">
                  <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                  <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                  <option value="GBP" ${settings.currency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                  <option value="EGP" ${settings.currency === 'EGP' ? 'selected' : ''}>EGP (E£)</option>
                  <option value="SAR" ${settings.currency === 'SAR' ? 'selected' : ''}>SAR (﷼)</option>
                </select>
              </div>
              <button class="btn btn-primary" id="btn-save">${icon('save')} Save Settings</button>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><h3>Preferences</h3></div>
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Timezone</label>
                <select class="form-control" id="s-timezone">
                  <option value="UTC" ${settings.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
                  <option value="America/New_York" ${settings.timezone === 'America/New_York' ? 'selected' : ''}>America/New_York</option>
                  <option value="Europe/London" ${settings.timezone === 'Europe/London' ? 'selected' : ''}>Europe/London</option>
                  <option value="Africa/Cairo" ${settings.timezone === 'Africa/Cairo' ? 'selected' : ''}>Africa/Cairo</option>
                  <option value="Asia/Riyadh" ${settings.timezone === 'Asia/Riyadh' ? 'selected' : ''}>Asia/Riyadh</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Language</label>
                <select class="form-control" id="s-language">
                  <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                  <option value="ar" ${settings.language === 'ar' ? 'selected' : ''}>العربية</option>
                  <option value="fr" ${settings.language === 'fr' ? 'selected' : ''}>Français</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Opened Date</label>
                <input class="form-control" id="s-opened" type="date" value="${settings.opened_at || ''}" />
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>Danger Zone</h3></div>
          <div class="card-body">
            <p style="font-size:0.875rem;color:#64748b;margin-bottom:16px">Reset all demo data back to the original seeded state. This will erase all changes made in this browser.</p>
            <button class="btn btn-danger" id="btn-reset">${icon('trash')} Reset Demo Data</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-save').addEventListener('click', async () => {
      const data = {
        gym_name: container.querySelector('#s-name').value,
        currency: container.querySelector('#s-currency').value,
        timezone: container.querySelector('#s-timezone').value,
        language: container.querySelector('#s-language').value,
        opened_at: container.querySelector('#s-opened').value,
      };
      await SettingsService.update(data);
      toast({ title: 'Settings saved', variant: 'success' });
    });

    container.querySelector('#btn-reset').addEventListener('click', () => {
      confirmDialog({ title: 'Reset demo data', message: 'This will reset all data to the original state. Continue?', onConfirm: async () => {
        await SettingsService.resetDemoData();
        toast({ title: 'Demo data reset', description: 'Data restored to default', variant: 'success' });
        render(container);
      }});
    });
  }

  return { render };
})();

window.loadSettings = (container) => SettingsPage.render(container);
