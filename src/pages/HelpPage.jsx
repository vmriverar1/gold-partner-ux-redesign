import { ArrowRight, ListChecks, UserRound, MessageCircle, CheckCircle2, MapPin, ShieldCheck, Mail, Phone } from 'lucide-react';
import { company } from '../data/catalog.js';
import { useApp } from '../state.jsx';
import { BackLink, Link } from '../components.jsx';

const steps = [
  { title: 'Armas tu lista', text: 'Agrega productos, cantidades y notas. Aquí no hay pago en línea.', icon: ListChecks },
  { title: 'Dejas tus datos', text: 'Indica tu nombre, contacto y ciudad. Revisas todo antes de enviarlo.', icon: UserRound },
  { title: 'Un asesor te responde', text: 'Envía tu lista por WhatsApp para confirmar stock, precio y entrega.', icon: MessageCircle },
  { title: 'Confirmas y pagas', text: 'Con la cotización formal, coordinas el pago y la entrega con el asesor.', icon: CheckCircle2 },
];

export function HelpPage() {
  const { helpReturn } = useApp();
  return <div className="site-container help-page page-enter"><div className="page-topline"><span className="eyebrow">SIMPLE, CLARO Y SIN COMPROMISO</span><BackLink to={helpReturn}>Volver a donde estaba</BackLink></div><h1>Cómo funciona la solicitud</h1><p className="page-description">Primero eliges con calma. Después, un asesor te ayuda a cerrar los detalles.</p><div className="help-steps">{steps.map((step,index) => <article key={step.title}><span className="step-number">0{index + 1}</span><step.icon size={27} strokeWidth={1.4} /><div className="section-label">PASO {index + 1}</div><h2>{step.title}</h2><p>{step.text}</p></article>)}</div>
    <div className="help-info-grid"><section className="info-panel"><h2><ShieldCheck size={22} /> Datos que te pediremos</h2><p>Nombre y apellido, teléfono o WhatsApp y ciudad de entrega. El correo y las notas son opcionales.</p><div className="privacy-note">No pedimos datos de tarjeta ni documentos en este paso.</div><p className="small-note">Tus datos se guardan en este navegador y solo se comparten al completar el envío en WhatsApp. No uses datos sensibles en las notas.</p></section><section className="info-panel"><h2><MapPin size={22} /> Dónde estamos</h2><p><b>Punto de recojo en San Isidro</b><br />{company.address}.</p><p className="small-note">Lun–vie: 10–12 y 13–18 h · Sáb: 10–13 h. Recojo coordinado; no es tienda de venta.</p><div className="contact-links"><a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a><a href={`tel:+5117118255`}><Phone size={16} /> Teléfono</a><a href={`mailto:${company.email}`}><Mail size={16} /> Correo</a></div></section></div>
    <div className="help-bottom"><Link to="/solicitud/1" className="btn btn-gold">Continuar a mi solicitud <ArrowRight size={18} /></Link><BackLink to={helpReturn}>Volver a donde estaba</BackLink></div><p className="small-note">El asesor confirma las condiciones y el tiempo de atención. Este prototipo no garantiza una respuesta dentro de un plazo específico.</p>
  </div>;
}
