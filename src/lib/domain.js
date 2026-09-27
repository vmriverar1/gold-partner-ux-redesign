const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const DEFAULT_FILTERS = { min: 0, max: 10000, ram: [], storage: [], os: [], use: '' };

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
  return products.filter(product => {
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

export function deliveryFor(city) {
  return normalize(city) === 'lima'
    ? { label: '2–4 días hábiles', detail: 'Plazo referencial. El asesor confirma la fecha y las condiciones de entrega.' }
    : { label: 'Entrega por confirmar', detail: 'El asesor confirma el transporte, costo y plazo para tu ciudad.' };
}
