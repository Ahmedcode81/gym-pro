/* ============================================================
   GymPro - POS Service
   Manages a point-of-sale cart and processes sales.
   ============================================================ */
const PosService = (() => {
  const { request, fail } = window.GymProApi;

  // Cart is stored in memory (or could be localStorage)
  let cart = [];
  const CART_KEY = 'gympro_cart';

  function loadCart() {
    try {
      cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) { cart = []; }
    return cart;
  }
  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function getCart() {
    return request(() => loadCart());
  }

  function addToCart(item) {
    return request(() => {
      loadCart();
      const existing = cart.find((c) => String(c.inventory_id) === String(item.inventory_id));
      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        cart.push({ ...item, quantity: item.quantity || 1 });
      }
      saveCart();
      return cart;
    });
  }

  function updateQuantity(inventoryId, qty) {
    return request(() => {
      loadCart();
      const item = cart.find((c) => String(c.inventory_id) === String(inventoryId));
      if (item) {
        item.quantity = Math.max(1, qty);
        saveCart();
      }
      return cart;
    });
  }

  function removeFromCart(inventoryId) {
    return request(() => {
      loadCart();
      cart = cart.filter((c) => String(c.inventory_id) !== String(inventoryId));
      saveCart();
      return cart;
    });
  }

  function clearCart() {
    return request(() => {
      cart = [];
      saveCart();
      return cart;
    });
  }

  function total() {
    return request(() => {
      loadCart();
      return cart.reduce((s, c) => s + Number(c.price || 0) * Number(c.quantity || 1), 0);
    });
  }

  function checkout(memberId, paymentMethod) {
    return request(() => {
      loadCart();
      if (cart.length === 0) fail('Cart is empty');
      const items = [...cart];
      const amount = items.reduce((s, c) => s + Number(c.price || 0) * Number(c.quantity || 1), 0);

      // Deduct inventory
      items.forEach((it) => {
        const inv = GymProDB.get('inventory', it.inventory_id);
        if (inv) {
          const qty = Math.max(0, Number(inv.quantity) - Number(it.quantity || 1));
          GymProDB.update('inventory', inv.id, { quantity: qty });
        }
      });

      // Create a payment record
      const member = GymProDB.get('members', memberId);
      const record = GymProDB.create('payments', {
        member_id: memberId || null,
        member_name: member ? member.full_name : 'Walk-in Customer',
        plan_name: 'POS Sale',
        amount,
        method: paymentMethod || 'Cash',
        status: 'completed',
        date: new Date().toISOString().slice(0, 10),
        reference: 'POS-' + (100000 + Math.floor(Math.random() * 90000)),
      });

      GymProDB.create('activities', {
        action: 'POS sale completed',
        user: GymProAuth.currentUser()?.full_name || 'System',
        timestamp: new Date().toISOString(),
      });

      cart = [];
      saveCart();
      return record;
    });
  }

  return { getCart, addToCart, updateQuantity, removeFromCart, clearCart, total, checkout };
})();

window.PosService = PosService;
