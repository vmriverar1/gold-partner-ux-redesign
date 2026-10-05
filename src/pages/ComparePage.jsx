import { useState } from 'react';
import { ArrowRight, Plus, X, ArrowLeftRight } from 'lucide-react';
import { products } from '../data/catalog.js';
import { deliveryFor } from '../lib/domain.js';
import { useApp } from '../state.jsx';
import { BackLink, EmptyState, Link, money } from '../components.jsx';

export function ComparePage() {
  const { session, update, add, lastCatalog, destinationCity } = useApp();
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const selected = session.compare.map(id => products.find(p => p.id === id));
  const delivery = deliveryFor(destinationCity).label;
  const category = selected[0]?.category;
  const characteristics = category === 'laptops'
    ? [['Procesador',p => p.processor || 'Sin dato'],['Memoria RAM',p => p.ram ? `${p.ram} GB` : 'Sin dato'],['Almacenamiento',p => p.storage ? `SSD ${p.storage === 1024 ? '1 TB' : `${p.storage} GB`}` : 'Sin dato'],['Pantalla',p => p.screen || 'Sin dato'],['Sistema operativo',p => p.os || 'Sin dato']]
    : [['Características principales',p => p.summary || 'Sin dato'], ...(category === 'monitores' && selected.some(p => p.screen) ? [['Pantalla',p => p.screen || 'Sin dato']] : [])];
  const rows = [['Precio (IGV incluido)',p => money(p.price)], ...characteristics, ['Disponibilidad',p => p.stock <= 3 ? `Últimas ${p.stock} unidades` : `Disponible · ${p.stock} unidades`],['Garantía',p => p.warranty || 'Sin dato'],[`Entrega a ${destinationCity}`,() => delivery]];
  const changed = (fn) => new Set(selected.map(fn)).size > 1;
  if (selected.length < 2) return <div className="site-container page-enter"><BackLink to={lastCatalog} /><EmptyState title="Elige al menos dos productos" description="Marca Comparar en el catálogo. Puedes comparar hasta tres productos de la misma categoría." action="Elegir productos" to={lastCatalog} /></div>;
  return <div className="site-container compare-page page-enter"><div className="page-topline"><span className="eyebrow">ELIGE CON INFORMACIÓN</span><BackLink to={lastCatalog} /></div><div className="compare-title-row"><div><h1>Comparando {selected.length} productos</h1><p>Mismos campos, diferencias claras. Tú eliges el equipo.</p></div><label className="compare-check"><input className="form-check-input" type="checkbox" checked={differencesOnly} onChange={e => setDifferencesOnly(e.target.checked)} /><span>Solo diferencias</span></label></div>
    <p className="mobile-scroll-hint"><ArrowLeftRight size={16} /> Desliza para comparar todos los productos</p><div className="comparison-scroll" tabIndex={0} role="region" aria-label="Tabla comparativa, desplazamiento horizontal"><table className="comparison-table"><caption className="sr-only">Comparación de características equivalentes de {selected.length} productos</caption><thead><tr><th scope="col" className="attribute-heading">Producto</th>{selected.map(p => <th key={p.id} scope="col"><div className="compare-product-photo"><img src={p.image} alt={p.name} width="400" height="400" /><button className="icon-button" aria-label={`Quitar ${p.name} de comparación`} onClick={() => update({ compare: session.compare.filter(id => id !== p.id) })}><X size={16} /></button></div><div className="product-brand">{p.brand}</div><Link to={`/producto/${p.id}`}>{p.name}</Link></th>)}</tr></thead><tbody>{rows.filter(([,fn]) => !differencesOnly || changed(fn)).map(([label,fn]) => <tr className={changed(fn) ? 'difference-row' : ''} key={label}><th scope="row">{label}{changed(fn) && <span className="difference-marker" title="Valores diferentes" />}</th>{selected.map(p => <td key={p.id}>{fn(p)}</td>)}</tr>)}<tr className="compare-actions-row"><th scope="row">Acciones</th>{selected.map(p => <td key={p.id}><button className="btn btn-gold" onClick={() => add(p)}><Plus size={17} /> Agregar</button><Link to={`/producto/${p.id}`} className="detail-link">Ver ficha <ArrowRight size={15} /></Link></td>)}</tr></tbody></table></div>
    <div className="comparison-notes"><span className="difference-marker" /><p>Resaltamos las filas con diferencias. Los campos no disponibles se muestran como “Sin dato”. Stock, garantía y entrega del prototipo son referenciales.</p></div>
  </div>;
}
