import { ArrowRight, Check, ShieldCheck, MessageCircle, ListChecks } from 'lucide-react';
import { categories, uses, products } from '../data/catalog.js';
import { DEFAULT_FILTERS, filterProducts } from '../lib/domain.js';
import { useApp } from '../state.jsx';
import { Icon, Link } from '../components.jsx';

export function CategoriesPage() {
  const { session, update } = useApp();
  const activeUse = session.filters.use;
  const choose = (use) => update({ filters: { ...DEFAULT_FILTERS, use: activeUse === use ? '' : use }, query: '' });
  const chooseCategory = () => update({ filters: { ...DEFAULT_FILTERS, use: activeUse }, query: '' });
  return <div className="site-container categories-page page-enter">
    <div className="category-intro"><div><div className="eyebrow"><span /> ENCUENTRA TU PRÓXIMO EQUIPO</div><h1>Elige una categoría</h1><p>O dinos para qué lo vas a usar y filtramos por ti.</p></div><div className="intro-note"><ListChecks size={24} strokeWidth={1.5} /><span>Explora el catálogo.<br /><b>Elige con información, sin apuro.</b></span></div></div>
    <section className="use-selector" aria-label="Seleccionar uso"><h2>¿Para qué lo vas a usar?</h2><div className="use-buttons">{uses.map(use => <button className={`use-button ${activeUse === use.id ? 'selected' : ''}`} aria-pressed={activeUse === use.id} key={use.id} onClick={() => choose(use.id)}><Icon name={use.icon} /><span>{use.label}</span>{activeUse === use.id && <Check size={16} />}</button>)}</div>{activeUse && <p className="use-feedback" role="status">Mostramos opciones para {uses.find(u => u.id === activeUse)?.label.toLowerCase()}. <button className="text-button" onClick={() => choose(activeUse)}>Quitar selección</button></p>}</section>
    <div className="category-grid">{categories.map((category, index) => {
      const count = filterProducts(products.filter(p => p.category === category.id), { ...DEFAULT_FILTERS, use: activeUse }).length;
      return <Link to={`/catalogo/${category.id}`} onClick={chooseCategory} className={`category-card category-${category.id}`} aria-label={`Ver opciones de ${category.title}`} key={category.id} style={{ '--card-index': index }}><div className="category-art"><span className="category-number">0{index + 1}</span><img src={category.image} alt={`Categoría ${category.title}`} width="400" height="400" /><span className="category-symbol"><Icon name={category.icon} size={19} /></span></div><div className="category-card-body"><h2>{category.title}</h2><p>{category.description}</p><span className="option-count">{count} {count === 1 ? 'opción disponible' : 'opciones disponibles'}</span><span className="category-cta">Ver opciones <ArrowRight size={18} /></span></div></Link>;
    })}</div>
    <div className="all-products-link"><span>¿Ya sabes qué necesitas?</span><Link to="/catalogo/todos" onClick={() => update({ filters: { ...DEFAULT_FILTERS }, query: '' })}>Ver todos los productos <ArrowRight size={16} /></Link></div>
    <div className="catalog-assurance"><div><ShieldCheck size={21} /><span><b>Información clara</b><small>Precio con IGV y garantía a la vista</small></span></div></div>
  </div>;
}
