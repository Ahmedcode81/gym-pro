/* ============================================================
   GymPro - POS Page
   Point of Sale with cart, product search, checkout.
   ============================================================ */
const PosPage = (() => {
  const { icon, esc, money, toast } = window.GymProUtils;

  function num(n) { return Number(n || 0).toLocaleString(); }

  async function render(container) {
    const [cartRes, invRes] = await Promise.all([PosService.getCart(), InventoryService.list({ page: 1, pageSize: 200 })]);
    const cart = cartRes.data || [];
    const inventory = invRes.data.items || [];
    const cartTotal = cart.reduce((s, c) => s + Number(c.price || 0) * Number(c.quantity || 1), 0);

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="page-head">
          <div>
            <h1>Point of Sale</h1>
            <p>Process retail sales and services</p>
          </div>
          <div class="page-head-actions">
            <button class="btn btn-outline" id="btn-clear">${icon('trash')} Clear Cart</button>
          </div>
        </div>
        <div class="grid grid-2">
          <div class="card">
            <div class="card-header"><h3>Products</h3></div>
            <div class="card-body">
              <div class="search-box" style="margin-bottom:16px">
                ${icon('search')}
                <input type="text" id="pos-search" placeholder="Search products..." />
              </div>
              <div class="grid grid-2" style="max-height:520px;overflow-y:auto">
                ${inventory.filter((i) => i.quantity > 0).map((i) => `
                  <div class="card" style="padding:12px;cursor:pointer" data-add="${i.id}" data-name="${esc(i.name)}" data-price="${i.price}">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                      <div>
                        <div style="font-weight:600;font-size:0.875rem;color:#1e293b">${esc(i.name)}</div>
                        <div style="font-size:0.75rem;color:#64748b">${esc(i.category)} · ${num(i.quantity)} in stock</div>
                      </div>
                      <span class="badge badge-info">${money(i.price)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Current Sale</h3></div>
            <div class="card-body">
              <div style="max-height:340px;overflow-y:auto;margin-bottom:16px">
                ${cart.length === 0 ? '<div class="empty-state">Cart is empty. Add products to begin.</div>' : cart.map((c) => `
                  <div class="activity-item">
                    <div style="flex:1;min-width:0">
                      <div style="font-weight:500;font-size:0.875rem;color:#1e293b">${esc(c.name)}</div>
                      <div style="font-size:0.75rem;color:#64748b">${money(c.price)} × ${c.quantity}</div>
                    </div>
                    <strong>${money(c.price * c.quantity)}</strong>
                    <button class="btn-icon btn-icon-danger" data-remove="${c.inventory_id}">${icon('x')}</button>
                  </div>
                `).join('')}
              </div>
              <div class="form-group">
                <label class="form-label">Member (optional)</label>
                <select class="form-control" id="pos-member">
                  <option value="">Walk-in Customer</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Payment Method</label>
                <select class="form-control" id="pos-method">
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Mobile Payment">Mobile Payment</option>
                </select>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-top:1px solid var(--border)">
                <div>
                  <div style="font-size:0.8125rem;color:#64748b">Total</div>
                  <div style="font-size:1.75rem;font-weight:700;color:#1e293b">${money(cartTotal)}</div>
                </div>
                <button class="btn btn-primary" id="btn-checkout" ${cart.length === 0 ? 'disabled' : ''}>${icon('shoppingCart')} Checkout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Load members for checkout
    MembersService.list({ page: 1, pageSize: 200 }).then((res) => {
      const memberSelect = container.querySelector('#pos-member');
      (res.data.items || []).forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.full_name;
        memberSelect.appendChild(opt);
      });
    });

    // Search filter
    const searchInput = container.querySelector('#pos-search');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      container.querySelectorAll('[data-add]').forEach((el) => {
        const name = (el.dataset.name || '').toLowerCase();
        el.style.display = name.includes(q) ? '' : 'none';
      });
    });

    // Add product
    container.querySelectorAll('[data-add]').forEach((el) => {
      el.addEventListener('click', async () => {
        await PosService.addToCart({ inventory_id: el.dataset.add, name: el.dataset.name, price: Number(el.dataset.price), quantity: 1 });
        toast({ title: 'Added to cart', description: el.dataset.name, variant: 'success' });
        render(container);
      });
    });

    // Remove from cart
    container.querySelectorAll('[data-remove]').forEach((el) => {
      el.addEventListener('click', async () => {
        await PosService.removeFromCart(el.dataset.remove);
        render(container);
      });
    });

    // Clear cart
    container.querySelector('#btn-clear').addEventListener('click', async () => {
      await PosService.clearCart();
      toast({ title: 'Cart cleared', variant: 'info' });
      render(container);
    });

    // Checkout
    container.querySelector('#btn-checkout').addEventListener('click', async () => {
      const memberId = container.querySelector('#pos-member').value || null;
      const method = container.querySelector('#pos-method').value;
      await PosService.checkout(memberId, method);
      toast({ title: 'Sale completed', description: money(cartTotal) + ' processed', variant: 'success' });
      render(container);
    });
  }

  return { render };
})();

window.loadPos = (container) => PosPage.render(container);
