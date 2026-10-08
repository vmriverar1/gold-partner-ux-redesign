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
  if (upper > DEFAULT_FILTERS.max) return 'El presupuesto no puede superar S/ 10 000.';
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

export function validateContact(contact = {}) {
  const errors = {};
  const preference = normalize(contact.preference);
  if (!['whatsapp', 'llamada', 'correo', 'email'].includes(preference)) errors.preference = 'Elige cómo prefieres que te contacten.';
  if (String(contact.name ?? '').trim().split(/\s+/).filter(Boolean).length < 2) errors.name = 'Ingresa tu nombre y apellido.';
  const phone = String(contact.phone ?? '').replace(/[\s()-]/g, '').replace(/^\+?51/, '');
  if (!/^9\d{8}$/.test(phone)) errors.phone = 'Ingresa un celular peruano de 9 dígitos que empiece con 9.';
  const email = String(contact.email ?? '').trim();
  if (['correo', 'email'].includes(preference) && !email) errors.email = 'Ingresa el correo donde prefieres recibir la respuesta.';
  else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Ingresa un correo electrónico válido.';
  if (!String(contact.city ?? '').trim()) errors.city = 'Selecciona la ciudad de entrega.';
  return errors;
}

export function requestMessage(request, products) {
  const contact = request.contact ?? {};
  const city = request.city || contact.city || 'Por confirmar';
  const costs = request.costs ?? calculateCosts(request.items ?? [], products, city);
  const lines = [
    'Hola, Gold Partner. Quiero solicitar una cotización.',
    `Referencia: ${request.reference ?? 'Sin referencia'}`,
    '',
    'PRODUCTOS',
  ];
  for (const item of request.items ?? []) {
    const product = products.find(candidate => candidate.id === item.id);
    if (!product) continue;
    lines.push(`${item.qty} × ${product.name} | SKU: ${product.sku ?? 'Sin dato'} | ${money(product.price)} por unidad (IGV incluido)`);
    if (String(item.note ?? '').trim()) lines.push(`Nota del producto: ${String(item.note).trim()}`);
  }
  if (String(request.note ?? '').trim()) lines.push('', `Nota para el asesor: ${String(request.note).trim()}`);
  lines.push(
    '',
    'COSTO REFERENCIAL',
    `Productos (IGV incluido): ${money(costs.productsTotal)}`,
    `Base sin IGV: ${money(costs.base)}`,
    `IGV incluido (18%): ${money(costs.tax)}`,
    `Envío a ${city}: ${costs.shipping === null ? 'Por confirmar' : money(costs.shipping)}`,
    `${costs.shipping === null ? 'Subtotal conocido' : 'Total estimado'}: ${money(costs.total)}`,
    'Stock, importes y entrega sujetos a confirmación del asesor.',
    '',
    'MIS DATOS',
    `Nombre: ${contact.name ?? ''}`,
    `Teléfono / WhatsApp: ${contact.phone ?? ''}`,
    `Correo: ${contact.email || 'No indicado'}`,
    `Ciudad de entrega: ${city}`,
    `Contacto preferido: ${contact.preference || 'WhatsApp'}`,
  );
  return lines.join('\n');
}

export function whatsappUrl(request, products) {
  return `https://wa.me/51963718705?text=${encodeURIComponent(requestMessage(request, products))}`;
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
