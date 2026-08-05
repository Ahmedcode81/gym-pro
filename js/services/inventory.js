/* ============================================================
   GymPro - Inventory Service
   ============================================================ */
const InventoryService = (() => {
  const { request } = window.GymProApi;

  function list(opts = {}) {
    return request(() => GymProDB.query('inventory', opts));
  }
  function get(id) {
    return request(() => GymProDB.get('inventory', id));
  }
  function create(data) {
    return request(() => {
      const quantity = Number(data.quantity) || 0;
      const reorder = Number(data.reorder_level) || 0;
      const record = GymProDB.create('inventory', {
        ...data,
        quantity,
        reorder_level: reorder,
        status: quantity === 0 ? 'out_of_stock' : (quantity <= reorder ? 'low_stock' : 'in_stock'),
      });
      GymProDB.create('activities', {
        action: 'Inventory item added',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });
      return record;
    });
  }
  function update(id, data) {
    return request(() => {
      const current = GymProDB.get('inventory', id);
      const quantity = data.quantity !== undefined ? Number(data.quantity) : (current ? Number(current.quantity) : 0);
      const reorder = data.reorder_level !== undefined ? Number(data.reorder_level) : (current ? Number(current.reorder_level) : 0);
      const record = GymProDB.update('inventory', id, {
        ...data,
        quantity,
        reorder_level: reorder,
        status: quantity === 0 ? 'out_of_stock' : (quantity <= reorder ? 'low_stock' : 'in_stock'),
      });
      return record;
    });
  }
  function remove(id) {
    return request(() => GymProDB.remove('inventory', id));
  }
  function adjustStock(id, delta) {
    return request(() => {
      const item = GymProDB.get('inventory', id);
      if (!item) return null;
      const quantity = Math.max(0, Number(item.quantity) + delta);
      return GymProDB.update('inventory', id, {
        quantity,
        status: quantity === 0 ? 'out_of_stock' : (quantity <= Number(item.reorder_level) ? 'low_stock' : 'in_stock'),
      });
    });
  }
  return { list, get, create, update, remove, adjustStock };
})();

window.InventoryService = InventoryService;
