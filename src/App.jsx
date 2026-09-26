import { AppProvider, useApp } from './state.jsx';
import { Header, Footer, EmptyState } from './components.jsx';
import { CategoriesPage } from './pages/CategoriesPage.jsx';
import { CatalogPage } from './pages/CatalogPage.jsx';

function Site() {
  const { route } = useApp();
  const [, section, param] = route.split('/');
  let content;
  if (!section) content = <CategoriesPage />;
  else if (section === 'catalogo') content = <CatalogPage category={param || 'todos'} />;
  else content = <EmptyState title="Esta página no está en el catálogo" description="Vuelve a las categorías para continuar." action="Ver categorías" to="/" />;
  return <div className="site"><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Saltar al contenido</a><Header /><main id="main-content" tabIndex={-1}>{content}</main><Footer /></div>;
}

export default function App() { return <AppProvider><Site /></AppProvider>; }
