import { useEffect, useRef, useState } from 'react';
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react';
import { categories, products, uses } from '../data/catalog.js';
import { DEFAULT_FILTERS, filterProducts, validateBudget } from '../lib/domain.js';
import { useApp } from '../state.jsx';
import { Breadcrumb, EmptyState, Link, ProductCard, categoryName } from '../components.jsx';

const copyFilters = (filters) => ({ ...filters, ram: [...filters.ram], storage: [...filters.storage], os: [...filters.os] });
const normalizeOption = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const storageLabel = value => `SSD ${Number(value) >= 1024 ? `${Number(value) / 1024} TB` : `${value} GB`}`;
const budgetValidation = ({ min, max }) => min === '' || max === '' ? 'Completa ambos montos de presupuesto.' : validateBudget(min, max);

export function CatalogPage({ category }) {
  const { session, update } = useApp();
  const [budget, setBudget] = useState(() => ({ min: session.filters.min, max: session.filters.max }));
  const [budgetError, setBudgetError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const panel = useRef(null);
  const opener = useRef(null);
  const resetBudget = () => { setBudget({ min: session.filters.min, max: session.filters.max }); setBudgetError(''); };
  const closeFilters = () => { resetBudget(); setMobileOpen(false); };
  useEffect(() => { resetBudget(); }, [session.filters.min, session.filters.max]);
  useEffect(() => {
    if (!mobileOpen) { resetBudget(); return; }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('button')?.focus();
    const handleKeys = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); setMobileOpen(false); }
      if (e.key !== 'Tab') return;
      const focusable = [...panel.current.querySelectorAll('button, input, select, summary, a[href]')].filter(el => !el.disabled && el.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handleKeys);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKeys); opener.current?.focus(); };
  }, [mobileOpen]);

  const base = products.filter(p => category === 'todos' || p.category === category);
  const filtered = filterProducts(base, session.filters, session.query);
  const visible = [...filtered].sort((a, b) => session.sort === 'price-up' ? a.price - b.price : session.sort === 'price-down' ? b.price - a.price : session.sort === 'name' ? a.name.localeCompare(b.name) : 0);
  const supportsTech = category === 'laptops' || category === 'todos';
  const applyBudget = (next) => {
    const error = budgetValidation(next);
    if (error) { setBudgetError(error); return; }
    const range = { min: Number(next.min), max: Number(next.max) };
    setBudget(range);
    setBudgetError('');
    update(prev => ({ filters: { ...prev.filters, ...range } }));
  };
  const editBudget = (field, value) => {
    const next = { ...budget, [field]: value };
    setBudget(next);
    setBudgetError(budgetValidation(next));
  };
  const clear = () => { setBudget({ min: 0, max: 10000 }); setBudgetError(''); update({ filters: copyFilters(DEFAULT_FILTERS), query: '' }); };
  const clearBudget = () => { setBudget({ min: 0, max: 10000 }); setBudgetError(''); update(prev => ({ filters: { ...prev.filters, min: 0, max: 10000 } })); };
  const toggle = (field, value) => update(prev => ({ filters: { ...prev.filters, [field]: prev.filters[field].some(v => normalizeOption(v) === normalizeOption(value)) ? prev.filters[field].filter(v => normalizeOption(v) !== normalizeOption(value)) : [...prev.filters[field], value] } }));
  const countFor = (field, value) => filterProducts(base, { ...session.filters, [field]: [value] }, session.query).length;
  const numericOptions = (field) => [...new Set(base.map(product => Number(product[field])).filter(value => value > 0))].sort((a, b) => a - b);
  const osOptions = [...base.reduce((options, product) => {
    const value = normalizeOption(product.os);
    if (value && !options.has(value)) options.set(value, { value, label: String(product.os).trim() });
    return options;
  }, new Map()).values()];
  const chips = [];
  if (Number(session.filters.min) > 0 || Number(session.filters.max) < 10000) chips.push({ key: 'budget', label: `S/ ${Number(session.filters.min).toLocaleString('es-PE')} – ${Number(session.filters.max).toLocaleString('es-PE')}`, aria: 'Quitar filtro de presupuesto', remove: clearBudget });
  for (const field of ['ram', 'storage', 'os']) for (const value of session.filters[field]) chips.push({ key: `${field}-${value}`, label: field === 'ram' ? `${value} GB RAM` : field === 'storage' ? storageLabel(value) : osOptions.find(option => option.value === normalizeOption(value))?.label || value, aria: `Quitar filtro ${field} ${value}`, remove: () => toggle(field, value) });
  if (session.filters.use) chips.push({ key: 'use', label: uses.find(u => u.id === session.filters.use)?.label || session.filters.use, aria: 'Quitar filtro de uso', remove: () => update({ filters: { ...session.filters, use: '' } }) });
  if (session.query) chips.push({ key: 'search', label: `Búsqueda: ${session.query}`, aria: 'Quitar búsqueda', remove: () => update({ query: '' }) });
  const group = (field, title, options) => <details className="filter-group" open><summary>{title}</summary><div className="filter-options">{options.map(option => {
    const checked = session.filters[field].some(value => normalizeOption(value) === normalizeOption(option.value));
    const count = countFor(field, option.value);
    return <label className={`filter-check ${count === 0 && !checked ? 'disabled' : ''}`} key={option.value}><input className="form-check-input" type="checkbox" checked={checked} disabled={!count && !checked} onChange={() => toggle(field, option.value)} /><span>{option.label}</span><small>{count}</small></label>;
  })}</div></details>;

  if (!categories.some(c => c.id === category) && category !== 'todos') return <div className="site-container"><EmptyState title="No encontramos esta categoría" description="Explora las categorías disponibles." action="Ver categorías" to="/" /></div>;
  return <div className="site-container catalog-page page-enter"><Breadcrumb category={category} /><div className="catalog-heading"><div><div className="eyebrow">CATÁLOGO GOLD PARTNER</div><h1>{categoryName(category)}</h1><p>Encuentra el equipo que encaja contigo. Compara antes de decidir.</p></div><Link to="/" className="back-link">Cambiar categoría <ArrowRight size={16} /></Link></div>
    <p className="catalog-demo-note">Catálogo de demostración · Stock y entrega referenciales. El asesor confirma disponibilidad.</p>
    <div className="catalog-layout">
      {mobileOpen && <button className="filter-backdrop" onClick={closeFilters} aria-label="Cerrar panel de filtros" />}
      <aside ref={panel} className={`filter-panel ${mobileOpen ? 'is-open' : ''}`} role={mobileOpen ? 'dialog' : undefined} aria-modal={mobileOpen ? 'true' : undefined} aria-label="Filtros de productos"><div className="filter-panel-heading"><h2><SlidersHorizontal size={20} /> Filtros</h2><button className="filter-close icon-button" aria-label="Cerrar filtros" onClick={closeFilters}><X size={20} /></button></div><form onSubmit={event => { event.preventDefault(); applyBudget(budget); }} onKeyDown={event => { if (event.key === 'Enter' && event.target.type === 'number') { event.preventDefault(); applyBudget(budget); } }}>
        <section className="budget-filter"><h3>Presupuesto</h3><div className="budget-inputs"><label><span>Desde S/</span><input className="form-control" aria-label="Presupuesto mínimo" aria-invalid={Boolean(budgetError)} aria-describedby={budgetError ? 'budget-error' : undefined} type="number" min="0" max="10000" step="1" value={budget.min} onChange={e => editBudget('min', e.target.value)} onBlur={() => applyBudget(budget)} /></label><label><span>Hasta S/</span><input className="form-control" aria-label="Presupuesto máximo" aria-invalid={Boolean(budgetError)} aria-describedby={budgetError ? 'budget-error' : undefined} type="number" min="0" max="10000" step="1" value={budget.max} onChange={e => editBudget('max', e.target.value)} onBlur={() => applyBudget(budget)} /></label></div>
          <div className="budget-sliders"><input type="range" aria-label="Ajustar presupuesto mínimo" min="0" max="10000" step="100" value={session.filters.min} onChange={e => applyBudget({ min: Math.min(Number(e.target.value), session.filters.max), max: session.filters.max })} /><input type="range" aria-label="Ajustar presupuesto máximo" min="0" max="10000" step="100" value={session.filters.max} onChange={e => applyBudget({ min: session.filters.min, max: Math.max(Number(e.target.value), session.filters.min) })} /></div>
          <div className="budget-presets">{[[0,1500,'Hasta 1 500'],[1500,3000,'1 500–3 000'],[3000,10000,'3 000 +']].map(([min,max,label]) => <button type="button" key={label} className={Number(session.filters.min) === min && Number(session.filters.max) === max ? 'selected' : ''} onClick={() => applyBudget({ min, max })}>{label}</button>)}</div>{budgetError && <p id="budget-error" className="field-error" role="alert">{budgetError}</p>}
        </section>
        {supportsTech && <>{group('ram', 'Memoria RAM', numericOptions('ram').map(value => ({ value, label: `${value} GB` })))}{group('storage', 'Almacenamiento', numericOptions('storage').map(value => ({ value, label: storageLabel(value) })))}{group('os', 'Sistema operativo', osOptions)}</>}
        <div className="filter-footer">{mobileOpen && <button type="button" className="btn btn-dark" onClick={closeFilters}>Ver {visible.length} {visible.length === 1 ? 'resultado' : 'resultados'} <ArrowRight size={16} /></button>}<button className="text-button" type="button" onClick={clear}>Limpiar</button><p>Los filtros se actualizan automáticamente.</p></div>
      </form></aside>
      <section className="catalog-results" aria-label="Resultados del catálogo"><div className="results-toolbar"><div className="result-count" role="status"><b>{visible.length}</b> {visible.length === 1 ? 'opción' : 'opciones'}<span>Precios con IGV incluido</span></div><div className="results-controls"><button ref={opener} className="btn btn-outline mobile-filter" onClick={() => setMobileOpen(true)}><SlidersHorizontal size={17} /> Filtros {chips.length > 0 && <span>{chips.length}</span>}</button><label className="sort-select"><span>Ordenar por</span><select aria-label="Ordenar productos" value={session.sort} onChange={e => update({ sort: e.target.value })}><option value="recommended">Recomendados</option><option value="price-up">Menor precio</option><option value="price-down">Mayor precio</option><option value="name">Nombre A–Z</option></select></label></div></div>
        {chips.length > 0 && <div className="active-filters">{chips.map(chip => <button className="filter-chip" key={chip.key} onClick={chip.remove} aria-label={chip.aria}>{chip.label}<X size={14} /></button>)}<button className="text-button clear-all" onClick={clear}>Quitar todos</button></div>}
        {visible.length ? <div className="product-grid">{visible.map((p,index) => <ProductCard key={p.id} product={p} index={index} />)}</div> : <EmptyState title="No encontramos una coincidencia" description="Prueba con un rango más amplio o quita algún filtro." action="Quitar todos los filtros" onAction={clear} />}
        <div className="data-disclaimer"><span className="status-dot" /><p>Estás explorando un prototipo: stock y entrega son referenciales. Tu asesor confirma disponibilidad y precio final.</p></div>
      </section>
    </div>
  </div>;
}
