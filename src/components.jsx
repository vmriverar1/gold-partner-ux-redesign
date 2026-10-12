import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, FileText, GraduationCap, BriefcaseBusiness, Palette, Gamepad2, Laptop, Monitor, Printer, Mouse, MapPin, Search, ShieldCheck, Truck, X, Layers3, Plus, Phone, Mail, MessageCircle } from 'lucide-react';
import { categories, cities, company, products } from './data/catalog.js';
import { calculateCosts, deliveryFor } from './lib/domain.js';
import { useApp } from './state.jsx';

export function Icon({ name, size = 20, ...props }) {
  const icons = { 'graduation-cap': GraduationCap, briefcase: BriefcaseBusiness, palette: Palette, 'gamepad-2': Gamepad2, laptop: Laptop, monitor: Monitor, printer: Printer, mouse: Mouse };
  const Component = icons[name] || Laptop;
  return <Component size={size} strokeWidth={1.7} aria-hidden="true" {...props} />;
}
export const money = (value) => `S/ ${Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const categoryName = (id) => categories.find(c => c.id === id)?.title || 'Todos los productos';
export const specs = (p) => p.summary || (p.ram ? `${p.ram} GB RAM · SSD ${p.storage >= 1024 ? `${p.storage / 1024} TB` : `${p.storage} GB`}` : p.screen || 'Consulta las características en la ficha');

export function Link({ to, children, onClick, ...props }) {
  const { navigate } = useApp();
  return <a href={`#${to}`} {...props} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(to);
  }}>{children}</a>;
}

export function CitySelect({ id = 'global-city', compact = false }) {
  const { session, changeCity } = useApp();
  return <div className={`city-select ${compact ? 'compact' : ''}`}>
    <MapPin size={19} aria-hidden="true" />
    <div><label htmlFor={id}>Entregar en</label><select id={id} aria-label={id === 'global-city' ? 'Ciudad de entrega' : 'Cambiar ciudad de entrega'} value={session.city} onChange={e => changeCity(e.target.value)}>{cities.map(city => <option key={city} value={city}>{city === 'Otra ciudad' && session.otherCity ? session.otherCity : city}</option>)}</select></div>
    <ChevronDown size={14} aria-hidden="true" />
  </div>;
}

export function Header() {
  const { session, update, navigate } = useApp();
  const [search, setSearch] = useState(session.query);
  useEffect(() => setSearch(session.query), [session.query]);
  const count = session.items.reduce((sum, item) => sum + item.qty, 0);
  const submitSearch = (e) => { e.preventDefault(); update({ query: search.trim(), filters: { min: 0, max: 10000, ram: [], storage: [], os: [], use: '' } }); navigate('/catalogo/todos'); };
  return <>
    <div className="service-strip"><div className="site-container"><span><ShieldCheck size={13} /> Tecnología con asesoría personalizada</span><span className="strip-end">Prototipo UX <span className="strip-dot" /> Sin pagos en línea</span></div></div>
    <header className="main-header"><div className="site-container header-inner">
      <Link to="/" className="brand" aria-label="Gold Partner, ir al inicio"><img src={company.logo} alt="Gold Partner" width="230" height="71" /></Link>
      <form className="search-form" role="search" onSubmit={submitSearch}><Search size={19} aria-hidden="true" /><input type="search" aria-label="Buscar producto" placeholder="¿Qué tecnología estás buscando?" value={search} onChange={e => setSearch(e.target.value)} /><button type="submit" aria-label="Buscar"><ArrowRight size={20} /></button></form>
      <CitySelect />
      <Link to={session.lastRequest && !session.draftDirty ? '/solicitud/3' : '/solicitud/1'} className="request-button" aria-label={`Mi solicitud ${count} unidades`}><FileText size={20} /><span>Mi solicitud</span><b aria-hidden="true">{count}</b></Link>
    </div></header>
  </>;
}

export function Breadcrumb({ category, product }) {
  return <nav className="breadcrumb-nav" aria-label="Ruta de navegación"><Link to="/">Inicio</Link><span>/</span>{product ? <><Link to={`/catalogo/${category}`}>{categoryName(category)}</Link><span>/</span><span>{product}</span></> : <span aria-current="page">{categoryName(category)}</span>}</nav>;
}

export function Footer() {
  const { help } = useApp();
  return <footer className="footer"><div className="site-container">
    <div className="footer-top"><div className="footer-brand"><span>GOLD<span>PARTNER</span></span><p>Tecnología para lo que viene.</p></div><div><h3>Conversemos</h3><a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> +51 963 718 705</a><a href={`tel:+5117118255`}><Phone size={16} /> {company.phone}</a><a href={`mailto:${company.email}`}><Mail size={16} /> {company.email}</a></div><div className="footer-address"><h3>Punto de recojo</h3><p>{company.address}</p><p className="muted-light">Recojo coordinado con el asesor. No es tienda de venta.</p></div></div>
    <div className="footer-bottom"><span>© 2026 {company.name} · Prototipo académico de rediseño</span><button className="text-button light" onClick={help}>¿Cómo funciona la solicitud?</button></div>
  </div></footer>;
}

export function CompareControl({ product }) {
  const { session, compare } = useApp();
  return <label className="compare-check"><input type="checkbox" className="form-check-input" aria-label={`Comparar ${product.name}`} checked={session.compare.includes(product.id)} onChange={() => compare(product)} /><span>Comparar</span></label>;
}

export function ProductCard({ product: p, index = 0 }) {
  const { add, destinationCity } = useApp();
  const delivery = deliveryFor(destinationCity);
  return <article className="product-card" data-testid="product-card" style={{ '--card-index': index }}>
    <Link to={`/producto/${p.id}`} className="product-photo" aria-label={`Ver ficha de ${p.name}`}><span className="product-type">{categoryName(p.category)}</span><img src={p.image} alt={p.name} width="400" height="400" loading={index > 1 ? 'lazy' : 'eager'} /></Link>
    <div className="product-card-body"><div className="product-brand">{p.brand}</div><h2><Link to={`/producto/${p.id}`}>{p.name}</Link></h2><div className="product-hardware">{p.processor && <p className="product-processor">{p.processor}</p>}<p className="product-specs">{specs(p)}</p></div>
      <div className="product-price">{money(p.price)}<small>IGV incluido</small></div>
      <div className={`stock-line ${p.stock <= 3 ? 'low-stock' : ''}`}><span className="status-dot" />{p.stock <= 3 ? 'Últimas unidades' : 'Disponible'}</div>
      <p className="delivery-line"><Truck size={15} /> {delivery.label}<span className="sr-only">, referencial</span></p>
      <div className="card-bottom"><CompareControl product={p} /><div className="product-actions"><button className="btn btn-gold" onClick={() => add(p)} disabled={!p.stock}><Plus size={17} /> Agregar</button><Link to={`/producto/${p.id}`} className="detail-link">Ver ficha <ArrowRight size={15} /></Link></div></div>
    </div>
  </article>;
}

export const shouldShowCompareTray = (route, count) => count > 0 && !['/comparar', '/como-funciona'].includes(route) && !route.startsWith('/solicitud');

export function CompareTray() {
  const { session, update, navigate, route } = useApp();
  if (!shouldShowCompareTray(route, session.compare.length)) return null;
  return <aside className="compare-tray" aria-label="Productos seleccionados para comparar"><div className="site-container tray-inner"><div className="tray-heading"><Layers3 size={22} /><div><b>Compara y elige</b><small>{session.compare.length} de 3 seleccionados</small></div></div><div className="tray-products">{session.compare.map(id => {
    const p = products.find(product => product.id === id);
    return <div className="tray-product" key={id}><img src={p.image} alt="" /><span>{p.name}</span><button aria-label={`Quitar ${p.name} de comparación`} onClick={() => update({ compare: session.compare.filter(value => value !== id) })}><X size={15} /></button></div>;
  })}</div><button className="btn btn-dark" disabled={session.compare.length < 2} onClick={() => navigate('/comparar')}>Ver comparación <ArrowRight size={17} /></button></div></aside>;
}

export function CostSummary({ items, city, title = 'Resumen estimado', compact = false, cost }) {
  const { destinationCity } = useApp();
  const destination = city || destinationCity;
  const costs = cost || calculateCosts(items, products, destination);
  return <section className={`cost-summary ${compact ? 'compact' : ''}`} aria-label={title}><h3>{title}</h3><dl><div><dt>Productos sin IGV <small>({costs.quantity} {costs.quantity === 1 ? 'unidad' : 'unidades'})</small></dt><dd>{money(costs.base)}</dd></div><div><dt>IGV incluido (18%)</dt><dd>{money(costs.tax)}</dd></div><div><dt>Envío estimado a {destination}</dt><dd>{costs.shipping === null ? 'Por confirmar' : money(costs.shipping)}</dd></div><div className="cost-total"><dt>{costs.shipping === null ? 'Subtotal conocido' : 'Total estimado'}</dt><dd>{money(costs.total)}</dd></div></dl><p className="estimate-note">Tarifas de envío simuladas. Montos referenciales; el asesor confirma la cotización.</p></section>;
}

export function EmptyState({ title, description, action, onAction, to }) {
  return <div className="empty-state"><div className="empty-icon"><Search size={32} strokeWidth={1.3} /></div><h2>{title}</h2><p>{description}</p>{to ? <Link className="btn btn-dark" to={to}>{action} <ArrowRight size={17} /></Link> : <button className="btn btn-dark" onClick={onAction}>{action}</button>}</div>;
}

export function Toast() {
  const { toast, setToast } = useApp();
  if (!toast) return null;
  return <div className={`feedback-toast ${toast.kind}`} role="status" aria-live="polite"><CheckCircle2 size={21} /><div>{toast.message}{toast.action && <Link to={toast.action.path}>{toast.action.label} <ArrowRight size={14} /></Link>}</div><button onClick={() => setToast(null)} aria-label="Cerrar aviso"><X size={17} /></button></div>;
}

export function BackLink({ to, children = 'Volver al catálogo' }) {
  return <Link to={to} className="back-link"><ArrowLeft size={16} />{children}</Link>;
}
