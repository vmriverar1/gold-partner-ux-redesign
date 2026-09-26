import { ArrowRight, ChevronDown, GraduationCap, BriefcaseBusiness, Palette, Gamepad2, Laptop, Monitor, Printer, Mouse, MapPin, Search, ShieldCheck, Truck, Phone, Mail, MessageCircle } from 'lucide-react';
import { categories, cities, company } from './data/catalog.js';
import { deliveryFor } from './lib/domain.js';
import { useApp } from './state.jsx';

export function Icon({ name, size = 20, ...props }) {
  const icons = { 'graduation-cap': GraduationCap, briefcase: BriefcaseBusiness, palette: Palette, 'gamepad-2': Gamepad2, laptop: Laptop, monitor: Monitor, printer: Printer, mouse: Mouse };
  const Component = icons[name] || Laptop;
  return <Component size={size} strokeWidth={1.7} aria-hidden="true" {...props} />;
}
export const money = value => `S/ ${Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const categoryName = id => categories.find(c => c.id === id)?.title || 'Todos los productos';
export const specs = p => p.summary || (p.ram ? `${p.ram} GB RAM · SSD ${p.storage >= 1024 ? `${p.storage / 1024} TB` : `${p.storage} GB`}` : p.screen || 'Características del producto');

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
  return <div className={`city-select ${compact ? 'compact' : ''}`}><MapPin size={19} aria-hidden="true" /><div><label htmlFor={id}>Entregar en</label><select id={id} aria-label={id === 'global-city' ? 'Ciudad de entrega' : 'Cambiar ciudad de entrega'} value={session.city} onChange={e => changeCity(e.target.value)}>{cities.map(city => <option key={city} value={city}>{city}</option>)}</select></div><ChevronDown size={14} aria-hidden="true" /></div>;
}

export function Header() {
  return <><div className="service-strip"><div className="site-container"><span><ShieldCheck size={13} /> Tecnología con asesoría personalizada</span><span className="strip-end">Prototipo UX <span className="strip-dot" /> Sin pagos en línea</span></div></div><header className="main-header"><div className="site-container header-inner"><Link to="/" className="brand" aria-label="Gold Partner, ir al inicio"><img src={company.logo} alt="Gold Partner" width="230" height="71" /></Link><CitySelect /></div></header></>;
}

export function Breadcrumb({ category, product }) {
  return <nav className="breadcrumb-nav" aria-label="Ruta de navegación"><Link to="/">Inicio</Link><span>/</span>{product ? <><Link to={`/catalogo/${category}`}>{categoryName(category)}</Link><span>/</span><span>{product}</span></> : <span aria-current="page">{categoryName(category)}</span>}</nav>;
}

export function Footer() {
  return <footer className="footer"><div className="site-container"><div className="footer-top"><div className="footer-brand"><span>GOLD<span>PARTNER</span></span><p>Tecnología para lo que viene.</p></div><div><h3>Conversemos</h3><a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> +51 963 718 705</a><a href="tel:+5117118255"><Phone size={16} /> {company.phone}</a><a href={`mailto:${company.email}`}><Mail size={16} /> {company.email}</a></div><div className="footer-address"><h3>Punto de recojo</h3><p>{company.address}</p><p className="muted-light">Recojo coordinado con el asesor. No es tienda de venta.</p></div></div><div className="footer-bottom"><span>© 2026 {company.name} · Prototipo académico de rediseño</span></div></div></footer>;
}

export function ProductCard({ product: p, index = 0 }) {
  const { destinationCity } = useApp();
  const delivery = deliveryFor(destinationCity);
  return <article className="product-card" data-testid="product-card" style={{ '--card-index': index }}><div className="product-photo"><span className="product-type">{categoryName(p.category)}</span><img src={p.image} alt={p.name} width="400" height="400" loading={index > 1 ? 'lazy' : 'eager'} /></div><div className="product-card-body"><div className="product-brand">{p.brand}</div><h2>{p.name}</h2><div className="product-hardware">{p.processor && <p className="product-processor">{p.processor}</p>}<p className="product-specs">{specs(p)}</p></div><div className="product-price">{money(p.price)}<small>IGV incluido</small></div><div className={`stock-line ${p.stock <= 3 ? 'low-stock' : ''}`}><span className="status-dot" />{p.stock <= 3 ? 'Últimas unidades' : 'Disponible'}</div><p className="delivery-line"><Truck size={15} /> {delivery.label}<span className="sr-only">, referencial</span></p></div></article>;
}

export function EmptyState({ title, description, action, onAction, to }) {
  return <div className="empty-state"><div className="empty-icon"><Search size={32} strokeWidth={1.3} /></div><h2>{title}</h2><p>{description}</p>{to ? <Link className="btn btn-dark" to={to}>{action} <ArrowRight size={17} /></Link> : <button className="btn btn-dark" onClick={onAction}>{action}</button>}</div>;
}
