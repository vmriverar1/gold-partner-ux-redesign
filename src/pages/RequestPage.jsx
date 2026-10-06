import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, Download, FileText, LockKeyhole, MessageCircle, Minus, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { cities, company, products } from '../data/catalog.js';
import { calculateCosts, deliveryFor, requestMessage, validateContact, whatsappUrl } from '../lib/domain.js';
import { isValidOtherCity, useApp } from '../state.jsx';
import { BackLink, CitySelect, CostSummary, EmptyState, Link, money, specs } from '../components.jsx';

function WizardSteps({ step, hasItems }) {
  return <nav className="wizard-steps" aria-label="Pasos de la solicitud">{['Lista','Datos','Envío'].map((label,index) => <div className={`wizard-step ${step === index + 1 ? 'active' : ''} ${step > index + 1 ? 'complete' : ''}`} key={label} aria-current={step === index + 1 ? 'step' : undefined}><span>{step > index + 1 ? <Check size={15} /> : `0${index + 1}`}</span>{index === 0 || (index === 1 && hasItems && step >= 2) ? <Link to={`/solicitud/${index + 1}`}>{label}</Link> : <b>{label}</b>}{index < 2 && <i />}</div>)}</nav>;
}

function RequestItems({ request, editable = false }) {
  const items = Array.isArray(request.items) ? request.items.filter(item => item && typeof item === 'object') : [];
  const { changeQty, itemNote, remove } = useApp();
  return <div className={`request-items ${editable ? 'editable' : 'read-only'}`}>{items.map(item => {
    const p = products.find(product => product.id === item.id);
    if (!p) return null;
    return <article className="request-item" key={p.id}><Link to={`/producto/${p.id}`} className="request-item-photo"><img src={p.image} alt={p.name} width="100" height="100" /></Link><div className="request-item-content"><div className="product-brand">{p.brand}</div><h3><Link to={`/producto/${p.id}`}>{p.name}</Link></h3><p>{specs(p)}</p>{editable ? <label className="item-note"><span className="sr-only">Nota para {p.name}</span><input className="form-control" aria-label={`Nota para ${p.name}`} maxLength={500} placeholder="Nota para este producto (opcional)" value={item.note} onChange={e => itemNote(p.id, e.target.value)} /></label> : item.note && <p className="review-note">Nota: {item.note}</p>}</div><div className="request-item-controls">{editable ? <div className="quantity-stepper"><button aria-label={`Disminuir cantidad de ${p.name}`} disabled={item.qty <= 1} onClick={() => changeQty(p.id,-1)}><Minus size={14} /></button><input aria-label={`Cantidad de ${p.name}`} type="text" value={item.qty} readOnly /><button aria-label={`Aumentar cantidad de ${p.name}`} disabled={item.qty >= p.stock} onClick={() => changeQty(p.id,1)}><Plus size={14} /></button></div> : <span className="quantity-label">{item.qty} ×</span>}<b>{money(p.price * item.qty)}</b>{editable && <button className="text-button remove-item" onClick={() => remove(p.id)} aria-label={`Quitar ${p.name} de solicitud`}><Trash2 size={13} /> Quitar</button>}</div></article>;
  })}</div>;
}

function DeliverySummary({ city, editable = false }) {
  return <div className="request-delivery-summary"><span>Entrega a {city}</span><b>{deliveryFor(city).label}</b>{editable && <CitySelect id="request-city" compact />}</div>;
}

export function RequestPage({ step }) {
  const { session, destinationCity, update, navigate, help, notify } = useApp();
  const [errors, setErrors] = useState({});
  const [copyFallback, setCopyFallback] = useState(false);
  const items = session.items;
  const currentStep = [1,2,3].includes(step) ? step : 1;
  const prepare = (e) => {
    e.preventDefault();
    const concreteCity = session.city === 'Otra ciudad' ? (session.otherCity || '').trim() : destinationCity;
    const contact = { ...session.contact, city: concreteCity };
    const problems = validateContact(contact);
    if (session.city === 'Otra ciudad' && !isValidOtherCity(concreteCity)) problems.city = 'Ingresa el nombre de la ciudad, con letras y un máximo de 80 caracteres.';
    setErrors(problems);
    if (Object.keys(problems).length) {
      const first = Object.keys(problems)[0];
      document.getElementById(first === 'city' && session.city === 'Otra ciudad' ? 'contact-other-city' : `contact-${first}`)?.focus();
      return;
    }
    const request = {
      reference: `GP-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(), items: items.map(item => ({ ...item })),
      note: session.note, contact: { ...contact }, selectedCity: session.city, otherCity: (session.otherCity || '').trim(), city: concreteCity, costs: calculateCosts(items, products, concreteCity),
    };
    update({ lastRequest: request });
    navigate('/solicitud/3');
  };
  const updateContact = (field, value) => {
    update({ contact: { ...session.contact, [field]: value } });
    setErrors(prev => ({ ...prev, [field]: '' }));
  };
  const field = (name,label,type,placeholder,autoComplete) => <div className="contact-field"><label htmlFor={`contact-${name}`}>{label}{['name','phone'].includes(name) ? <span aria-hidden="true"> *</span> : <small> (opcional)</small>}</label><input className={`form-control ${errors[name] ? 'is-invalid' : ''}`} id={`contact-${name}`} type={type} value={session.contact[name]} placeholder={placeholder} autoComplete={autoComplete} maxLength={name === 'phone' ? 20 : 120} aria-required={['name','phone'].includes(name)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `error-${name}` : undefined} onChange={e => updateContact(name,e.target.value)} />{errors[name] && <p id={`error-${name}`} className="field-error" role="alert">{errors[name]}</p>}</div>;
  const otherCityField = session.city === 'Otra ciudad' && <div className="contact-field"><label htmlFor="contact-other-city">Nombre de la ciudad <span aria-hidden="true">*</span></label><input className={'form-control' + (errors.city ? ' is-invalid' : '')} id="contact-other-city" type="text" maxLength={80} value={session.otherCity || ''} placeholder="Ej.: Chiclayo" autoComplete="address-level2" aria-required="true" aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? 'error-city' : undefined} onChange={e => { update({ otherCity: e.target.value }); setErrors(prev => ({ ...prev, city: '' })); }} />{errors.city && <p id="error-city" className="field-error" role="alert">{errors.city}</p>}</div>;
  const last = session.lastRequest;
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); notify('Copiado. Ya puedes pegarlo donde lo necesites.'); }
    catch { setCopyFallback(true); notify('No pudimos acceder al portapapeles. Puedes seleccionar y copiar el texto mostrado.', 'error'); }
  };
  const download = () => {
    const blob = new Blob([requestMessage(last, products)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `${last.reference}.txt`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const duplicate = () => {
    update({ items: last.items.map(item => ({ ...item })), note: last.note, contact: { ...last.contact }, city: last.selectedCity || last.city, otherCity: last.otherCity || '' });
    navigate('/solicitud/1'); notify('Lista duplicada para una nueva solicitud. La referencia anterior sigue guardada.');
  };

  if ((currentStep === 3 && !last) || (currentStep !== 3 && !items.length)) return <div className="site-container request-page page-enter"><WizardSteps step={1} hasItems={false} /><EmptyState title="Tu solicitud empieza con una buena elección" description="Agrega productos del catálogo. Luego podrás ajustar cantidades, dejar notas y solicitar una cotización sin pagar en línea." action="Explorar el catálogo" to="/" /></div>;
  return <div className="site-container request-page page-enter"><WizardSteps step={currentStep} hasItems={Boolean(items.length)} />
    {currentStep === 1 && <><div className="request-heading"><div><div className="eyebrow">PRIMERO, ELIGE CON CALMA</div><h1>Mi solicitud <span>({items.length} {items.length === 1 ? 'producto' : 'productos'})</span></h1></div><button className="text-button" onClick={help}>¿Cómo funciona la solicitud?</button></div><RequestItems request={session} editable /><div className="request-list-bottom"><section className="general-note"><label htmlFor="general-note">Nota general para el asesor <small>(opcional)</small></label><textarea className="form-control" id="general-note" rows={4} maxLength={1000} placeholder="Ej.: necesito factura, entrega en oficina o asesoría para elegir…" value={session.note} onChange={e => update({ note:e.target.value })} /><Link to="/catalogo/todos" className="btn btn-outline"><Plus size={17} /> Agregar otro producto</Link></section><div className="request-estimate"><CostSummary items={items} city={destinationCity} /><DeliverySummary city={destinationCity} editable /></div></div><div className="request-bottom-actions"><button className="btn btn-dark" onClick={() => navigate('/solicitud/2')}>Continuar y revisar <ArrowRight size={18} /></button><span className="save-hint"><LockKeyhole size={15} /> Tu lista se guarda en este navegador</span></div></>}
    {currentStep === 2 && <><div className="request-heading"><div><div className="eyebrow">UN ASESOR TE AYUDARÁ CON LOS DETALLES</div><h1>Tus datos</h1></div><BackLink to="/solicitud/1">Volver a mi lista</BackLink></div><form className="request-data-layout" onSubmit={prepare} noValidate><section className="contact-form"><p className="form-intro">Cuéntanos cómo contactarte para confirmar tu cotización.</p>{field('name','Nombre y apellido','text','Ej.: Ana Quispe','name')}{field('phone','Teléfono o WhatsApp','tel','Ej.: 999 888 777','tel')}{field('email','Correo electrónico','email','Ej.: ana@correo.com','email')}<div className="contact-field"><label htmlFor="contact-city">Ciudad de entrega <span aria-hidden="true">*</span></label><select className="form-select" id="contact-city" value={session.city} aria-required="true" aria-invalid={session.city !== 'Otra ciudad' && Boolean(errors.city)} onChange={e => { update({ city:e.target.value }); setErrors(prev => ({ ...prev,city:'' })); }}>{cities.map(city => <option key={city}>{city}</option>)}</select>{session.city !== 'Otra ciudad' && errors.city && <p className="field-error" role="alert">{errors.city}</p>}</div>{otherCityField}<fieldset className="preference-field"><legend>¿Cómo prefieres que te contacten?</legend>{['WhatsApp','Llamada','Correo'].map(value => <label key={value}><input className="form-check-input" type="radio" name="preference" value={value} checked={session.contact.preference === value} onChange={() => updateContact('preference',value)} /><span>{value}</span></label>)}{errors.preference && <p className="field-error" role="alert">{errors.preference}</p>}</fieldset><p className="small-note">* Campos obligatorios. Si eliges Correo, también necesitas indicar tu dirección de correo.</p><div className="privacy-note"><ShieldCheck size={20} /><span>No pedimos tarjetas ni documentos. Guardamos tu borrador solo en este navegador.</span></div></section><aside className="request-review"><section className="review-panel"><div className="review-panel-heading"><h2>Lo que vas a enviar</h2><Link to="/solicitud/1" className="text-link">Volver a editar</Link></div><RequestItems request={session} />{session.note && <p className="review-note">Nota general: {session.note}</p>}<p className="small-note">Incluye cantidades, notas por producto y nota general.</p></section><div className="request-estimate"><CostSummary items={items} city={destinationCity} title="Costo estimado" /><DeliverySummary city={destinationCity} /></div><div className="next-step-note"><MessageCircle size={20} /><p>Al continuar, prepararemos el mensaje. El envío se completa en WhatsApp y el asesor confirma la cotización. <button type="button" className="text-button" onClick={help}>Ver los pasos completos</button></p></div><button className="btn btn-gold prepare-button" type="submit">Preparar solicitud <ArrowRight size={18} /></button><p className="small-note prepare-privacy">Aún no se enviará ningún dato a Gold Partner.</p></aside></form></>}
    {currentStep === 3 && <div className="request-success"><div className="success-heading"><div className="success-icon"><CheckCircle2 size={34} strokeWidth={1.5} /></div><div><div className="eyebrow">ÚLTIMO PASO: CONTINÚA EN WHATSAPP</div><h1>Tu solicitud está preparada</h1><p>Tu lista está lista. Falta enviar el mensaje para que el asesor la reciba.</p></div></div><div className="reference-bar"><div><span>Referencia local</span><b>{last.reference}</b></div><button className="text-button" onClick={() => copy(last.reference)}><Copy size={16} /> Copiar</button></div><div className="success-grid"><section className="info-panel"><h2><FileText size={21} /> Qué vas a enviar</h2><RequestItems request={last} /><div className="success-total"><span>{last.costs.shipping === null ? 'Subtotal conocido' : 'Total estimado'}</span><b>{money(last.costs.total)}</b></div><DeliverySummary city={last.city} /><p className="small-note">No se ha enviado un correo ni registrado una solicitud comercial. La referencia identifica tu borrador local.</p></section><section className="info-panel next-panel"><h2><MessageCircle size={21} /> Qué sigue</h2><ol><li>Abre WhatsApp con el mensaje que preparamos.</li><li>Revisa la lista y pulsa Enviar en WhatsApp.</li><li>Un asesor confirma stock, precio final y entrega.</li></ol><a className="btn btn-whatsapp" href={whatsappUrl(last, products)} target="_blank" rel="noopener noreferrer">Enviar por WhatsApp <ArrowRight size={18} /></a><button className="text-button" onClick={() => copy(requestMessage(last, products))}><Copy size={15} /> Copiar mensaje completo</button><p className="small-note">Compartirás los productos, notas y datos de contacto que revisaste. El plazo de respuesta se coordina con el asesor.</p><div className="direct-contact"><b>¿Necesitas ayuda?</b><a href="tel:+5117118255">{company.phone}</a><span>Atención remota: lunes a sábado, 10–24 h.</span></div></section></div>{copyFallback && <label className="copy-fallback">Selecciona y copia tu mensaje<textarea className="form-control" readOnly rows={10} value={requestMessage(last, products)} /></label>}<div className="success-actions"><button className="btn btn-outline" onClick={download}><Download size={17} /> Descargar la lista</button><Link to="/catalogo/todos" className="btn btn-dark">Volver al catálogo <ArrowRight size={17} /></Link><button className="text-button" onClick={duplicate}>Duplicar esta lista para otra solicitud</button></div></div>}
  </div>;
}
