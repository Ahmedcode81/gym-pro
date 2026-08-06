/* ============================================================
   GymPro - Nutrition Plans Service
   ============================================================ */
const NutritionService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => GymProDB.query('nutrition_plans', opts));
  }
  function get(id) {
    return request(() => GymProDB.get('nutrition_plans', id));
  }
  function create(data) {
    return request(() => {
      const record = GymProDB.create('nutrition_plans', {
        ...data,
        created_by: GymProAuth.currentUser()?.id || 1,
      });
      GymProDB.create('activities', {
        action: 'Nutrition plan created',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function update(id, data) {
    return request(() => GymProDB.update('nutrition_plans', id, data));
  }
  function remove(id) {
    return request(() => GymProDB.remove('nutrition_plans', id));
  }
  return { list, get, create, update, remove };
})();

window.NutritionService = NutritionService;
