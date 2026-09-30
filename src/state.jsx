import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_FILTERS, toggleComparison } from './lib/domain.js';
import { products } from './data/catalog.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState({ city: 'Lima', filters: { ...DEFAULT_FILTERS, ram: [], storage: [], os: [] }, query: '', sort: 'recommended', compare: [] });
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  const [toast, setToast] = useState(null);
  const [lastCatalog, setLastCatalog] = useState(route.startsWith('/catalogo') ? route : '/catalogo/laptops');
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
  const update = patch => setSession(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  const navigate = path => { setRoute(path); window.location.hash = path; };
  const changeCity = city => update({ city });
  const destinationCity = session.city;
  const notify = (message, kind = 'success') => setToast({ message, kind });
  const compare = product => {
    const result = toggleComparison(session.compare, product, products);
    if (result.error) notify(result.error, 'error');
    else update({ compare: result.ids });
  };
  return <AppContext.Provider value={{ session, destinationCity, update, route, navigate, changeCity, compare, toast, setToast, notify, lastCatalog }}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
