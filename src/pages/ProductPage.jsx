import { useState } from 'react';
import { ArrowRight, ChevronDown, Plus, ShieldCheck, Truck, Info } from 'lucide-react';
import { products, uses } from '../data/catalog.js';
import { deliveryFor } from '../lib/domain.js';
import { useApp } from '../state.jsx';
import { Breadcrumb, CitySelect, CompareControl, CostSummary, EmptyState, money } from '../components.jsx';

export function ProductPage({ id }) {
  const p = products.find(product => product.id === id);
  const { destinationCity, add } = useApp();
  const [photo, setPhoto] = useState(0);
  if (!p) return <div className="site-container"><EmptyState title="Este producto no está disponible" description="Puedes volver al catálogo y buscar otro equipo." action="Volver al catálogo" to="/catalogo/todos" /></div>;
  const delivery = deliveryFor(destinationCity);
  const specifications = [['Características',p.summary],['Procesador',p.processor],['Memoria RAM',p.ram ? `${p.ram} GB` : null],['Almacenamiento',p.storage ? `SSD ${p.storage === 1024 ? '1 TB' : `${p.storage} GB`}` : null],['Pantalla',p.screen],['Sistema operativo',p.os],['Código de producto',p.sku]].filter(([,value]) => value);
  return <div className="site-container product-page page-enter"><Breadcrumb category={p.category} product={p.name} /><div className="product-detail-layout">
    <div className="product-detail-left"><div className="detail-image-stage"><span className="photo-label">{p.brand.toUpperCase()} / {p.category.toUpperCase()}</span><img src={p.gallery[photo]} alt={`${p.name}, fotografía ${photo + 1}`} width="400" height="400" /><span className="image-count">{photo + 1} / {p.gallery.length}</span></div>
      <div className="product-thumbnails">{p.gallery.map((image,index) => <button key={image} className={photo === index ? 'active' : ''} aria-label={`Ver fotografía ${index + 1} de ${p.name}`} aria-pressed={photo === index} onClick={() => setPhoto(index)}><img src={image} alt="" width="80" height="80" /></button>)}<span>{p.gallery.length === 1 ? 'Fotografía del producto' : 'Selecciona una vista'}</span></div>
      <section className="main-specs"><div className="section-label">CONÓCELO MEJOR</div><h2>Características principales</h2><dl>{specifications.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      <div className="warranty-box"><ShieldCheck size={24} /><div><b>Garantía: {p.warranty}</b><p>Cobertura por defectos de fábrica. Condiciones y plazo sujetos a confirmación del asesor.</p></div></div>
    </div>
    <div className="product-detail-right"><div className="product-brand">{p.brand} · {p.sku}</div><h1>{p.name}</h1><div className={`stock-pill ${p.stock <= 3 ? 'low-stock' : ''}`}><span className="status-dot" />{p.stock <= 3 ? 'Últimas unidades' : 'Disponible'} · {p.stock} unidades <span className="sr-only">de demostración</span></div><p className="estimate-note">Stock de demostración. El asesor confirma disponibilidad.</p><p className="detail-price">{money(p.price)}<small>Precio referencial · IGV incluido</small></p><div className="product-use-tags">{p.uses.map(use => <span key={use}>{uses.find(u => u.id === use)?.label}</span>)}</div>
      <details className="cost-accordion"><summary>Desglose del costo <ChevronDown size={18} /></summary><CostSummary title="Costo referencial" items={[{ id:p.id,qty:1 }]} compact /><div className="cost-explainer"><Info size={15} /><span>El IGV ya está incluido en el precio. No se cobra dos veces.</span></div></details>
      <section className="delivery-box"><h2><Truck size={21} /> Entrega</h2><CitySelect id="product-city" compact /><b>{delivery.label}</b><p>{delivery.detail}</p><small>{destinationCity === 'Lima' ? 'También puedes coordinar el recojo en San Isidro.' : 'El flete provincial se coordina con el asesor.'}</small></section>
      <div className="detail-actions"><button className="btn btn-gold" onClick={() => add(p)}><Plus size={20} /> Agregar a solicitud <ArrowRight size={18} /></button><CompareControl product={p} /></div><div className="detail-reassurance"><ShieldCheck size={17} /><span>No pagas aquí. Primero recibes una cotización formal del asesor.</span></div>
    </div>
  </div></div>;
}
