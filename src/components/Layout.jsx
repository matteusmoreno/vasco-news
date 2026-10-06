import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Search, X } from 'lucide-react'
import clsx from 'clsx'
import { usePortal } from '../portal'
import { Cross } from './Cross'
import { PageSkeleton, StateMessage } from './Story'
import { Ticker } from './Ticker'

function SearchForm({ id, autoFocus = false }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryFromUrl = params.get('q') ?? ''
  const [draft, setDraft] = useState({ source: queryFromUrl, value: queryFromUrl })

  if (draft.source !== queryFromUrl) {
    setDraft({ source: queryFromUrl, value: queryFromUrl })
  }

  function onSubmit(event) {
    event.preventDefault()
    const next = draft.value.trim()
    if (!next) return
    navigate(`/busca?q=${encodeURIComponent(next)}`)
  }

  return (
    <form className="search" role="search" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={id}>
        Buscar notícias
      </label>
      <Search size={16} aria-hidden="true" />
      <input
        id={id}
        type="search"
        placeholder="Buscar no Vasco"
        value={draft.value}
        autoFocus={autoFocus}
        onChange={(event) => setDraft({ source: queryFromUrl, value: event.target.value })}
        enterKeyHint="search"
      />
    </form>
  )
}

function Brand({ portal }) {
  return (
    <Link to="/" className="brand">
      {portal?.theme?.logoUrl ? (
        <img className="brand-logo" src={portal.theme.logoUrl} alt="" />
      ) : (
        <Cross />
      )}
      <span>
        Vasco <em>News</em>
      </span>
    </Link>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  const { status, portal, categories, error, retry } = usePortal()
  const [menuPath, setMenuPath] = useState(null)
  const menuOpen = menuPath === pathname

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined
    function onKey(event) {
      if (event.key === 'Escape') setMenuPath(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="app">
      <a className="skip" href="#conteudo">
        Ir para o conteúdo
      </a>
      <header className="topbar">
        <div className="shell topbar-inner">
          <Brand portal={portal} />
          <nav className="desktop-nav" aria-label="Seções">
            <NavLink to="/" end className={({ isActive }) => clsx('nav-link', isActive && 'active')}>
              Capa
            </NavLink>
            <NavLink to="/ultimas" className={({ isActive }) => clsx('nav-link', isActive && 'active')}>
              Últimas
            </NavLink>
            {categories?.map((category) => (
              <NavLink
                key={category.categoryId}
                to={`/categoria/${category.slug}`}
                className={({ isActive }) => clsx('nav-link', isActive && 'active')}
              >
                {category.name}
              </NavLink>
            ))}
          </nav>
          <div className="topbar-tools">
            <SearchForm id="busca" />
            <button
              type="button"
              className="icon-button menu-button"
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              onClick={() => setMenuPath(menuOpen ? null : pathname)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
              <span className="sr-only">{menuOpen ? 'Fechar menu' : 'Abrir menu'}</span>
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="menu-mobile"
            className="drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <SearchForm id="busca-mobile" autoFocus />
            <nav aria-label="Seções">
              <NavLink to="/" end onClick={() => setMenuPath(null)}>
                Capa
              </NavLink>
              <NavLink to="/ultimas" onClick={() => setMenuPath(null)}>
                Últimas
              </NavLink>
              {categories?.map((category) => (
                <NavLink key={category.categoryId} to={`/categoria/${category.slug}`} onClick={() => setMenuPath(null)}>
                  {category.name}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {status === 'ready' ? <Ticker portalId={portal.portalId} /> : null}
      <main id="conteudo">
        {status === 'loading' ? (
          <div className="page">
            <PageSkeleton />
          </div>
        ) : null}
        {status === 'error' ? (
          <StateMessage
            title="A redação está fora do ar"
            text={error?.message || 'Não foi possível carregar o Vasco News.'}
          >
            <button type="button" className="button" onClick={retry}>
              Tentar de novo
            </button>
          </StateMessage>
        ) : null}
        {status === 'ready' ? (
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        ) : null}
      </main>
      <footer className="footer">
        <div className="shell footer-grid">
          <div className="footer-brand">
            <Cross />
            <strong>Vasco News</strong>
            <p>{portal?.description || 'Notícias do Vasco da Gama.'}</p>
          </div>
          <p>
            Portal independente sobre o Club de Regatas Vasco da Gama. Cada matéria aponta a fonte original da apuração.
          </p>
          <p className="copyright">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
