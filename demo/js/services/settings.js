/* ============================================================
   GymPro - Settings Service
   ============================================================ */
const SettingsService = (() => {
  const { request } = window.GymProApi;

  function get() {
    return request(() => {
      let settings = GymProDB.read('settings');
      if (!settings) {
        settings = {
          gym_name: 'GymPro Fitness Center',
          currency: 'USD',
          timezone: 'UTC',
          language: 'en',
          opened_at: new Date().toISOString().slice(0, 10),
        };
        GymProDB.write('settings', settings);
      }
      return settings;
    });
  }

  function update(data) {
    return request(() => {
      const settings = GymProDB.read('settings') || {};
      const merged = { ...settings, ...data };
      GymProDB.write('settings', merged);
      return merged;
    });
  }

  function resetDemoData() {
    return request(() => {
      GymProDB.reset();
      GymProSeed.seed();
      return true;
    });
  }

  return { get, update, resetDemoData };
})();

window.SettingsService = SettingsService;
