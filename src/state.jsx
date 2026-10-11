import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { products, cities, uses } from './data/catalog.js';
import { addItem, calculateCosts, DEFAULT_FILTERS, toggleComparison, updateQuantity, validateBudget, validateContact } from './lib/domain.js';

const STORAGE_KEY = 'gold-partner-ux-v1';
const AppContext = createContext(null);
const emptyContact = { name: '', phone: '', email: '', preference: 'WhatsApp' };
const freshFilters = () => ({ ...DEFAULT_FILTERS, ram: [], storage: [], os: [] });
const defaults = () => ({ items: [], compare: [], city: 'Lima', otherCity: '', filters: freshFilters(), query: '', sort: 'recommended', note: '', contact: { ...emptyContact }, lastRequest: null, history: [], draftDirty: true });
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export const isValidOtherCity = value => typeof value === 'string' && value.trim().length <= 80 && /^[\p{L}\p{M}\s.'’()-]+$/u.test(value.trim()) && (value.match(/\p{L}/gu)?.length ?? 0) >= 2;

function sanitizeItems(raw, discard) {
  if (!Array.isArray(raw)) { if (raw !== undefined) discard(); return []; }
  const result = [];
  for (const item of raw) {
    const product = isRecord(item) && products.find(p => p.id === item.id && p.stock > 0);
    if (!product || result.some(existing => existing.id === item.id)) { discard(); continue; }
    const inputQty = Number(item.qty);
    const qty = Math.min(product.stock, Math.max(1, Math.floor(inputQty || 1)));
    if (!Number.isFinite(inputQty) || inputQty !== qty) discard();
    const note = typeof item.note === 'string' ? item.note.slice(0, 500) : '';
    if (item.note !== undefined && (typeof item.note !== 'string' || item.note.length > 500)) discard();
    result.push({ id: product.id, qty, note });
  }
  return result;
}

function sanitizeRequest(raw, discard) {
  if (!isRecord(raw) || typeof raw.reference !== 'string' || !raw.reference.trim() || !isRecord(raw.contact) || !isRecord(raw.costs) || typeof raw.city !== 'string') { discard(); return null; }
  const items = sanitizeItems(raw.items, discard);
  const validCosts = ['base','tax','total','quantity','productsTotal'].every(field => typeof raw.costs[field] === 'number' && Number.isFinite(raw.costs[field]) && raw.costs[field] >= 0)
    && (raw.costs.shipping === null || (typeof raw.costs.shipping === 'number' && Number.isFinite(raw.costs.shipping) && raw.costs.shipping >= 0));
  if (!items.length || !validCosts) { discard(); return null; }
  const selectedCity = cities.includes(raw.selectedCity) ? raw.selectedCity : cities.includes(raw.city) ? raw.city : 'Otra ciudad';
  const otherCity = selectedCity === 'Otra ciudad' ? (typeof raw.otherCity === 'string' ? raw.otherCity : raw.city === 'Otra ciudad' ? '' : raw.city).trim() : typeof raw.otherCity === 'string' ? raw.otherCity.slice(0, 80) : '';
  if (selectedCity === 'Otra ciudad' && !isValidOtherCity(otherCity)) { discard(); return null; }
  const city = selectedCity === 'Otra ciudad' ? otherCity : selectedCity;
  const contact = { ...emptyContact, city };
  for (const field of Object.keys(emptyContact)) {
    if (typeof raw.contact[field] === 'string') contact[field] = raw.contact[field].slice(0, 120);
    else if (raw.contact[field] !== undefined) discard();
  }
  if (Object.keys(validateContact(contact)).length) { discard(); return null; }
  const costs = calculateCosts(items, products, city);
  if (Object.keys(costs).some(field => costs[field] !== raw.costs[field])) discard();
  const validStart = typeof raw.whatsappStartedAt === 'string'
    && Number.isFinite(Date.parse(raw.whatsappStartedAt))
    && new Date(raw.whatsappStartedAt).toISOString() === raw.whatsappStartedAt;
  const status = raw.status === 'whatsapp_started' && validStart ? 'whatsapp_started' : 'prepared';
  if ((raw.status !== undefined && !['prepared', 'whatsapp_started'].includes(raw.status))
    || (raw.status === 'whatsapp_started' && !validStart)
    || (raw.status !== 'whatsapp_started' && raw.whatsappStartedAt != null)) discard();
  return {
    reference: raw.reference.trim().slice(0, 80), createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
    items, note: typeof raw.note === 'string' ? raw.note.slice(0, 1000) : '', contact,
    selectedCity, otherCity, city, costs, status,
    whatsappStartedAt: status === 'whatsapp_started' ? raw.whatsappStartedAt : null,
  };
}

function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved) return { data: defaults(), warning: '' };
    if (!isRecord(saved)) return { data: defaults(), warning: 'Los datos guardados no eran válidos y se descartaron. Puedes continuar con una nueva lista.' };
    let discarded = false;
    const discard = () => { discarded = true; };
    const data = defaults();
    data.items = sanitizeItems(saved.items, discard);
    let comparison = [];
    if (saved.compare !== undefined && !Array.isArray(saved.compare)) discard();
    for (const id of Array.isArray(saved.compare) ? saved.compare : []) {
      const product = products.find(p => p.id === id);
      if (product && !comparison.includes(id)) {
        const result = toggleComparison(comparison, product, products);
        comparison = result.ids;
        if (result.error) discard();
      } else discard();
    }
    data.compare = comparison;
    data.city = cities.includes(saved.city) ? saved.city : 'Lima';
    if (saved.city !== undefined && !cities.includes(saved.city)) discard();
    if (typeof saved.otherCity === 'string' && (!saved.otherCity.trim() || isValidOtherCity(saved.otherCity))) data.otherCity = saved.otherCity.slice(0, 80);
    else if (saved.otherCity !== undefined) discard();
    for (const [field, limit] of [['query',120],['note',1000]]) {
      if (typeof saved[field] === 'string') data[field] = saved[field].slice(0, limit);
      else if (saved[field] !== undefined) discard();
    }
    if (['recommended','price-up','price-down','name'].includes(saved.sort)) data.sort = saved.sort;
    else if (saved.sort !== undefined) discard();
    if (isRecord(saved.filters)) {
      const { min = 0, max = 10000 } = saved.filters;
      if (['number','string'].includes(typeof min) && ['number','string'].includes(typeof max) && !validateBudget(min, max)) { data.filters.min = Number(min); data.filters.max = Number(max); }
      else discard();
      for (const field of ['ram','storage','os']) {
        const values = saved.filters[field];
        if (values === undefined) continue;
        if (!Array.isArray(values)) { discard(); continue; }
        data.filters[field] = values.filter(value => {
          const valid = field === 'os' ? typeof value === 'string' && value.length <= 120 : ['number','string'].includes(typeof value) && Number.isFinite(Number(value)) && Number(value) > 0;
          if (!valid) discard();
          return valid;
        });
      }
      if (saved.filters.use === '' || uses.some(use => use.id === saved.filters.use)) data.filters.use = saved.filters.use;
      else if (saved.filters.use !== undefined) discard();
    } else if (saved.filters !== undefined) discard();
    if (isRecord(saved.contact)) {
      for (const field of Object.keys(emptyContact)) {
        if (typeof saved.contact[field] === 'string') data.contact[field] = saved.contact[field].slice(0, 120);
        else if (saved.contact[field] !== undefined) discard();
      }
    } else if (saved.contact !== undefined) discard();
    if (saved.lastRequest !== undefined && saved.lastRequest !== null) data.lastRequest = sanitizeRequest(saved.lastRequest, discard);
    if (Array.isArray(saved.history)) data.history = saved.history.map(request => sanitizeRequest(request, discard)).filter(Boolean);
    else if (saved.history !== undefined) discard();
    const uniqueHistory = new Map();
    for (const request of data.history) {
      const existing = uniqueHistory.get(request.reference);
      uniqueHistory.set(request.reference, existing?.status === 'whatsapp_started' ? existing : request);
    }
    if (data.lastRequest) {
      const historical = uniqueHistory.get(data.lastRequest.reference);
      const canonical = historical?.status === 'whatsapp_started' ? historical : data.lastRequest;
      uniqueHistory.set(canonical.reference, canonical);
      data.lastRequest = canonical;
    }
    data.history = [...uniqueHistory.values()];
    const matchesLast = data.lastRequest && JSON.stringify(data.items) === JSON.stringify(data.lastRequest.items)
      && data.note === data.lastRequest.note && data.city === data.lastRequest.selectedCity
      && data.otherCity === data.lastRequest.otherCity
      && Object.keys(emptyContact).every(field => data.contact[field] === data.lastRequest.contact[field]);
    data.draftDirty = typeof saved.draftDirty === 'boolean' ? saved.draftDirty : !matchesLast;
    return { data, warning: discarded ? 'Algunos datos guardados no eran válidos y se descartaron. Revisa tu lista antes de continuar.' : '' };
  } catch {
    return { data: defaults(), warning: 'No pudimos recuperar tu lista guardada. Puedes continuar; revisa que este navegador permita almacenamiento local.' };
  }
}

export function AppProvider({ children }) {
  const initial = useRef(null);
  if (!initial.current) initial.current = loadSession();
  const [session, setSession] = useState(initial.current.data);
  const [storageWarning, setStorageWarning] = useState(initial.current.warning);
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  const [toast, setToast] = useState(null);
  const [lastCatalog, setLastCatalog] = useState(route.startsWith('/catalogo') ? route : '/catalogo/laptops');
  const [helpReturn, setHelpReturn] = useState('/');

  const persist = (next) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { setStorageWarning('Tu navegador no permite guardar la lista. Se conservará solo mientras esta página esté abierta.'); }
  };
  useEffect(() => { persist(session); }, [session]);
  useEffect(() => {
    const handle = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handle);
    return () => window.removeEventListener('hashchange', handle);
  }, []);
  useEffect(() => {
    if (route.startsWith('/catalogo')) setLastCatalog(route);
    document.documentElement.scrollTop = 0;
    document.querySelector('main')?.focus({ preventScroll: true });
  }, [route]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 7500);
    return () => clearTimeout(timer);
  }, [toast]);

  const update = (patch) => setSession(prev => {
    const changes = typeof patch === 'function' ? patch(prev) : patch;
    const editsDraft = ['items', 'note', 'contact', 'city', 'otherCity'].some(field => field in changes && changes[field] !== prev[field]);
    return { ...prev, ...changes, ...(!('draftDirty' in changes) && editsDraft ? { draftDirty: true } : {}) };
  });
  const startWhatsApp = (reference) => {
    const request = session.history.find(entry => entry.reference === reference)
      || (session.lastRequest?.reference === reference ? session.lastRequest : null);
    if (!request) return;
    const started = { ...request, status: 'whatsapp_started', whatsappStartedAt: request.whatsappStartedAt || new Date().toISOString() };
    const history = session.history.some(entry => entry.reference === reference)
      ? session.history.map(entry => entry.reference === reference ? started : entry) : [...session.history, started];
    const next = { ...session, history, lastRequest: started };
    // Save before the anchor's default action hands off to WhatsApp.
    persist(next);
    setSession(next);
  };
  const navigate = (path) => { setRoute(path); window.location.hash = path; };
  const notify = (message, kind = 'success', action = null) => setToast({ message, kind, action });
  const add = (product) => {
    const existing = session.items.find(item => item.id === product.id);
    if (existing?.qty >= product.stock) return notify('Ya agregaste todas las unidades disponibles en este prototipo.', 'error');
    update(prev => ({ items: addItem(prev.items, product) }));
    notify(`Agregado: ${product.name}`, 'success', { label: 'Ver solicitud', path: '/solicitud/1' });
  };
  const compare = (product) => {
    const result = toggleComparison(session.compare, product, products);
    if (result.error) notify(result.error, 'error');
    else update({ compare: result.ids });
  };
  const changeCity = (city) => update({ city });
  const help = () => { if (route !== '/como-funciona') setHelpReturn(route); navigate('/como-funciona'); };
  const changeQty = (id, delta) => update(prev => ({ items: updateQuantity(prev.items, id, delta, products) }));
  const itemNote = (id, note) => update(prev => ({ items: prev.items.map(item => item.id === id ? { ...item, note } : item) }));
  const remove = (id) => update(prev => ({ items: prev.items.filter(item => item.id !== id) }));

  const destinationCity = session.city === 'Otra ciudad' ? (session.otherCity || '').trim() || 'Otra ciudad' : session.city;
  return <AppContext.Provider value={{ session, destinationCity, update, startWhatsApp, route, navigate, toast, setToast, notify, add, compare, changeCity, help, helpReturn, changeQty, itemNote, remove, storageWarning, lastCatalog }}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
