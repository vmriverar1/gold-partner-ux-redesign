import { LockKeyhole, Minus, Plus, Trash2 } from 'lucide-react';
import { products } from '../data/catalog.js';
import { deliveryFor } from '../lib/domain.js';
import { useApp } from '../state.jsx';
import { CitySelect, CostSummary, EmptyState, Link, money, specs } from '../components.jsx';

function RequestItems({ request }) {
  const items = Array.isArray(request.items) ? request.items.filter(item => item && typeof item === 'object') : [];
  const { changeQty, itemNote, remove } = useApp();
  return <div className="request-items editable">{items.map(item => {
    const p = products.find(product => product.id === item.id);
    if (!p) return null;
    return <article className="request-item" key={p.id}><Link to={`/producto/${p.id}`} className="request-item-photo"><img src={p.image} alt={p.name} width="100" height="100" /></Link><div className="request-item-content"><div className="product-brand">{p.brand}</div><h3><Link to={`/producto/${p.id}`}>{p.name}</Link></h3><p>{specs(p)}</p><label className="item-note"><span className="sr-only">Nota para {p.name}</span><input className="form-control" aria-label={`Nota para ${p.name}`} maxLength={500} placeholder="Nota para este producto (opcional)" value={item.note} onChange={e => itemNote(p.id, e.target.value)} /></label></div><div className="request-item-controls"><div className="quantity-stepper"><button aria-label={`Disminuir cantidad de ${p.name}`} disabled={item.qty <= 1} onClick={() => changeQty(p.id,-1)}><Minus size={14} /></button><input aria-label={`Cantidad de ${p.name}`} type="text" value={item.qty} readOnly /><button aria-label={`Aumentar cantidad de ${p.name}`} disabled={item.qty >= p.stock} onClick={() => changeQty(p.id,1)}><Plus size={14} /></button></div><b>{money(p.price * item.qty)}</b><button className="text-button remove-item" onClick={() => remove(p.id)} aria-label={`Quitar ${p.name} de solicitud`}><Trash2 size={13} /> Quitar</button></div></article>;
  })}</div>;
}

export function RequestPage() {
  const { session, destinationCity, update } = useApp();
  const items = session.items;
  const steps = <nav className="wizard-steps" aria-label="Lista de la solicitud"><div className="wizard-step active" aria-current="step"><span>01</span><Link to="/solicitud/1">Lista</Link></div></nav>;
  if (!items.length) return <div className="site-container request-page page-enter">{steps}<EmptyState title="Tu solicitud empieza con una buena elección" description="Agrega productos del catálogo. Puedes ajustar cantidades y guardar notas en tu lista." action="Explorar el catálogo" to="/" /></div>;
  return <div className="site-container request-page page-enter">{steps}
    <div className="request-heading"><div><div className="eyebrow">PRIMERO, ELIGE CON CALMA</div><h1>Mi solicitud <span>({items.length} {items.length === 1 ? 'producto' : 'productos'})</span></h1></div></div>
    <RequestItems request={session} />
    <div className="request-list-bottom"><section className="general-note"><label htmlFor="general-note">Nota general para el asesor <small>(opcional)</small></label><textarea className="form-control" id="general-note" rows={4} maxLength={1000} placeholder="Ej.: necesito factura, entrega en oficina o asesoría para elegir…" value={session.note} onChange={e => update({ note:e.target.value })} /><Link to="/catalogo/todos" className="btn btn-outline"><Plus size={17} /> Agregar otro producto</Link></section><div className="request-estimate"><CostSummary items={items} city={destinationCity} /><div className="request-delivery-summary"><span>Entrega a {destinationCity}</span><b>{deliveryFor(destinationCity).label}</b><CitySelect id="request-city" compact /></div></div></div>
    <div className="request-bottom-actions"><span className="save-hint"><LockKeyhole size={15} /> Tu lista se guarda en este navegador</span></div>
  </div>;
}
