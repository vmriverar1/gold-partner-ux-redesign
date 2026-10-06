import { AppProvider, useApp } from './state.jsx';
import { Header, Footer, CompareTray, EmptyState, Toast } from './components.jsx';
import { CategoriesPage } from './pages/CategoriesPage.jsx';
import { CatalogPage } from './pages/CatalogPage.jsx';
import { ProductPage } from './pages/ProductPage.jsx';
import { ComparePage } from './pages/ComparePage.jsx';
import { HelpPage } from './pages/HelpPage.jsx';
import { RequestPage } from './pages/RequestPage.jsx';

function Site() {
  const { route, storageWarning, session } = useApp();
  const [, section, param] = route.split('/');
  let content;
  if (!section) content = <CategoriesPage />;
  else if (section === 'catalogo') content = <CatalogPage category={param || 'todos'} />;
  else if (section === 'producto') content = <ProductPage key={param} id={param} />;
  else if (section === 'comparar') content = <ComparePage />;
  else if (section === 'como-funciona') content = <HelpPage />;
  else if (section === 'solicitud') content = <RequestPage step={Number(param) || 1} />;
  else content = <EmptyState title="Esta página no está en el catálogo" description="Vuelve a las categorías para continuar." action="Ver categorías" to="/" />;
  return <div className={`site ${session.compare.length ? 'has-compare' : ''}`}><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Saltar al contenido</a><Header />
    {storageWarning && <div className="storage-warning" role="alert">{storageWarning}</div>}
    <main id="main-content" tabIndex={-1}>{content}</main><Footer /><CompareTray /><Toast /></div>;
}

export default function App() { return <AppProvider><Site /></AppProvider>; }
