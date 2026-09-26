import { ArrowRight } from 'lucide-react';
import { categories, products } from '../data/catalog.js';
import { Breadcrumb, EmptyState, Link, ProductCard, categoryName } from '../components.jsx';

export function CatalogPage({ category }) {
  if (!categories.some(c => c.id === category) && category !== 'todos') return <div className="site-container"><EmptyState title="No encontramos esta categoría" description="Explora las categorías disponibles." action="Ver categorías" to="/" /></div>;
  const visible = products.filter(p => category === 'todos' || p.category === category);
  return <div className="site-container catalog-page page-enter"><Breadcrumb category={category} /><div className="catalog-heading"><div><div className="eyebrow">CATÁLOGO GOLD PARTNER</div><h1>{categoryName(category)}</h1><p>Encuentra el equipo que encaja contigo.</p></div><Link to="/" className="back-link">Cambiar categoría <ArrowRight size={16} /></Link></div><p className="catalog-demo-note">Catálogo de demostración · Stock y entrega referenciales. El asesor confirma disponibilidad.</p><section className="catalog-results" aria-label="Resultados del catálogo"><div className="results-toolbar"><div className="result-count" role="status"><b>{visible.length}</b> {visible.length === 1 ? 'opción' : 'opciones'}<span>Precios con IGV incluido</span></div></div><div className="product-grid">{visible.map((p, index) => <ProductCard key={p.id} product={p} index={index} />)}</div><div className="data-disclaimer"><span className="status-dot" /><p>Estás explorando un prototipo: stock y entrega son referenciales. Tu asesor confirma disponibilidad y precio final.</p></div></section></div>;
}
