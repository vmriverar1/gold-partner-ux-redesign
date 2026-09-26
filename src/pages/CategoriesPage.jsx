import { ArrowRight, ShieldCheck, ListChecks } from 'lucide-react';
import { categories, products } from '../data/catalog.js';
import { Icon, Link } from '../components.jsx';

export function CategoriesPage() {
  return <div className="site-container categories-page page-enter"><div className="category-intro"><div><div className="eyebrow"><span /> ENCUENTRA TU PRÓXIMO EQUIPO</div><h1>Elige una categoría</h1><p>Encuentra tecnología para estudiar, trabajar y crear.</p></div><div className="intro-note"><ListChecks size={24} strokeWidth={1.5} /><span>Explora el catálogo.<br /><b>Elige con información, sin apuro.</b></span></div></div><div className="category-grid">{categories.map((category, index) => {
    const count = products.filter(p => p.category === category.id).length;
    return <Link to={`/catalogo/${category.id}`} className={`category-card category-${category.id}`} aria-label={`Ver opciones de ${category.title}`} key={category.id} style={{ '--card-index': index }}><div className="category-art"><span className="category-number">0{index + 1}</span><img src={category.image} alt={`Categoría ${category.title}`} width="400" height="400" /><span className="category-symbol"><Icon name={category.icon} size={19} /></span></div><div className="category-card-body"><h2>{category.title}</h2><p>{category.description}</p><span className="option-count">{count} {count === 1 ? 'opción disponible' : 'opciones disponibles'}</span><span className="category-cta">Ver opciones <ArrowRight size={18} /></span></div></Link>;
  })}</div><div className="all-products-link"><span>¿Ya sabes qué necesitas?</span><Link to="/catalogo/todos">Ver todos los productos <ArrowRight size={16} /></Link></div><div className="catalog-assurance"><div><ShieldCheck size={21} /><span><b>Información clara</b><small>Precio con IGV y garantía a la vista</small></span></div></div></div>;
}
