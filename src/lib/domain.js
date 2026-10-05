export const DEFAULT_FILTERS = { min: 0, max: 10000, ram: [], storage: [], os: [], use: '' };

const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const money = (value) => `S/ ${Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const quantity = (value) => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;

export function validateBudget(min, max) {
  const lower = Number(min);
  const upper = Number(max);
  if (!Number.isFinite(lower) || !Number.isFinite(upper)) return 'Ingresa un presupuesto válido.';
  if (lower < 0 || upper < 0) return 'El presupuesto no puede ser negativo.';
  if (lower > upper) return 'El monto mínimo no puede superar al máximo.';
  return '';
}

export function filterProducts(products, filters = DEFAULT_FILTERS, query = '') {
  const active = { ...DEFAULT_FILTERS, ...filters };
  if (validateBudget(active.min, active.max)) return [];
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    if (product.price < Number(active.min) || product.price > Number(active.max)) return false;
    const searchable = normalize([product.name, product.brand, product.sku, product.category].join(' '));
    if (!terms.every(term => searchable.includes(term))) return false;
    if (active.use && !(product.uses ?? []).some(use => normalize(use) === normalize(active.use))) return false;
    return ['ram', 'storage', 'os'].every(attribute => {
      const selected = active[attribute] ?? [];
      return selected.length === 0 || selected.some(value => normalize(value) === normalize(product[attribute]));
    });
  });
}

export function calculateCosts(items, products, city) {
  let productCents = 0;
  let units = 0;
  for (const item of items) {
    const product = products.find(candidate => candidate.id === item.id);
    const qty = quantity(item.qty);
    if (!product || !qty || !Number.isFinite(Number(product.price))) continue;
    productCents += Math.round(Number(product.price) * 100) * qty;
    units += qty;
  }
  // The catalogue price includes IGV. The two rows only explain that price.
  const baseCents = Math.round(productCents / 1.18);
  const taxCents = productCents - baseCents;
  const shipping = units === 0 ? 0 : normalize(city) === 'lima' ? 25 : null;
  return {
    base: baseCents / 100,
    tax: taxCents / 100,
    shipping,
    total: (productCents + (shipping ?? 0) * 100) / 100,
    quantity: units,
    productsTotal: productCents / 100,
  };
}

export function deliveryFor(city) {
  return normalize(city) === 'lima'
    ? { label: '2–4 días hábiles', detail: 'Plazo referencial. El asesor confirma la fecha y las condiciones de entrega.' }
    : { label: 'Entrega por confirmar', detail: 'El asesor confirma el transporte, costo y plazo para tu ciudad.' };
}

export function updateQuantity(items, id, delta, products) {
  const product = products.find(candidate => candidate.id === id);
  if (!product || product.stock < 1) return items.map(item => ({ ...item }));
  return items.map(item => item.id === id
    ? { ...item, qty: Math.min(product.stock, Math.max(1, quantity(item.qty) + Number(delta || 0))) }
    : { ...item });
}

export function addItem(items, product) {
  if (!product || product.stock < 1) return items.map(item => ({ ...item }));
  if (items.some(item => item.id === product.id)) return updateQuantity(items, product.id, 1, [product]);
  return [...items.map(item => ({ ...item })), { id: product.id, qty: 1, note: '' }];
}

export function toggleComparison(ids, product, products) {
  if (ids.includes(product.id)) return { ids: ids.filter(id => id !== product.id), error: '' };
  if (ids.length >= 3) return { ids: [...ids], error: 'Puedes comparar hasta 3 productos. Quita uno para agregar otro.' };
  const existing = products.find(candidate => candidate.id === ids[0]);
  if (existing && normalize(existing.category) !== normalize(product.category)) {
    return { ids: [...ids], error: 'Compara productos de la misma categoría para evaluar características equivalentes.' };
  }
  return { ids: [...ids, product.id], error: '' };
}
