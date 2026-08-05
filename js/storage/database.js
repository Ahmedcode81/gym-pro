/* ============================================================
   GymPro - Database
   Generic localStorage CRUD engine with search, filter, sort,
   pagination. Persists to localStorage.
   ============================================================ */
const GymProDB = (() => {
  const PREFIX = 'gympro_';

  function key(name) {
    return PREFIX + name;
  }

  function read(name) {
    try {
      const raw = localStorage.getItem(key(name));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('DB read error', name, e);
      return null;
    }
  }

  function write(name, data) {
    localStorage.setItem(key(name), JSON.stringify(data));
  }

  function remove(name) {
    localStorage.removeItem(key(name));
  }

  // Check if a collection exists
  function exists(name) {
    return localStorage.getItem(key(name)) !== null;
  }

  // Create a collection if it doesn't exist
  function ensure(name, initial = []) {
    if (!exists(name)) {
      write(name, initial);
    }
  }

  // ---- CRUD ----
  function all(name) {
    const data = read(name);
    return Array.isArray(data) ? data : [];
  }

  function get(name, id) {
    return all(name).find((item) => String(item.id) === String(id)) || null;
  }

  function create(name, item) {
    const items = all(name);
    const nextId = items.reduce((max, it) => Math.max(max, Number(it.id) || 0), 0) + 1;
    const record = { id: nextId, ...item };
    items.push(record);
    write(name, items);
    return record;
  }

  function update(name, id, patch) {
    const items = all(name);
    const idx = items.findIndex((it) => String(it.id) === String(id));
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...patch, id: items[idx].id };
    write(name, items);
    return items[idx];
  }

  function remove(name, id) {
    const items = all(name);
    const next = items.filter((it) => String(it.id) !== String(id));
    write(name, next);
    return next.length !== items.length;
  }

  function bulkCreate(name, items) {
    const existing = all(name);
    let maxId = existing.reduce((m, it) => Math.max(m, Number(it.id) || 0), 0);
    const records = items.map((it, i) => {
      maxId += 1;
      return { id: maxId, ...it };
    });
    write(name, existing.concat(records));
    return records;
  }

  // ---- Query ----
  function where(name, predicate) {
    return all(name).filter(predicate);
  }

  // Advanced query: search across fields, optional filters
  // opts: { search, searchFields[], filters:{field:value}, sort:{field,dir}, page, pageSize }
  function query(name, opts = {}) {
    let items = all(name);

    // Search
    if (opts.search && opts.searchFields && opts.searchFields.length) {
      const q = String(opts.search).toLowerCase();
      items = items.filter((it) =>
        opts.searchFields.some((f) => String(it[f] ?? '').toLowerCase().includes(q))
      );
    }

    // Filters
    if (opts.filters) {
      Object.keys(opts.filters).forEach((f) => {
        const val = opts.filters[f];
        if (val !== undefined && val !== null && val !== '') {
          items = items.filter((it) => String(it[f]) === String(val));
        }
      });
    }

    // Sort
    if (opts.sort && opts.sort.field) {
      const dir = opts.sort.dir === 'desc' ? -1 : 1;
      items = [...items].sort((a, b) => {
        let av = a[opts.sort.field], bv = b[opts.sort.field];
        if (typeof av === 'string') { av = av.toLowerCase(); bv = String(bv).toLowerCase(); }
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }

    const total = items.length;

    // Paginate
    let pageData = items;
    if (opts.page && opts.pageSize) {
      const start = (opts.page - 1) * opts.pageSize;
      pageData = items.slice(start, start + opts.pageSize);
    }

    return { items: pageData, total };
  }

  // ---- Aggregates ----
  function count(name) {
    return all(name).length;
  }

  function sum(name, field, predicate) {
    return all(name)
      .filter((it) => (predicate ? predicate(it) : true))
      .reduce((acc, it) => acc + (Number(it[field]) || 0), 0);
  }

  // ---- Reset / seed ----
  function reset() {
    // Remove all gympro_ keys
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  }

  return {
    read, write, remove, exists, ensure, all, get, create, update, remove,
    bulkCreate, where, query, count, sum, reset, PREFIX,
  };
})();

window.GymProDB = GymProDB;
