import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_FILTERS } from './lib/domain.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState({ city: 'Lima', filters: { ...DEFAULT_FILTERS, ram: [], storage: [], os: [] }, query: '', sort: 'recommended' });
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  useEffect(() => {
    const handle = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handle);
    return () => window.removeEventListener('hashchange', handle);
  }, []);
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.querySelector('main')?.focus({ preventScroll: true });
  }, [route]);
  const update = patch => setSession(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  const navigate = path => { setRoute(path); window.location.hash = path; };
  const changeCity = city => update({ city });
  const destinationCity = session.city;
  return <AppContext.Provider value={{ session, destinationCity, update, route, navigate, changeCity }}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
