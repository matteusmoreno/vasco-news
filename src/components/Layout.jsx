import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Search, X } from 'lucide-react'
import clsx from 'clsx'
import { formatEdition } from '../format'
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

function Mark({ portal, className }) {
  if (portal?.theme?.logoUrl) {
    return <img className={className} src={portal.theme.logoUrl} alt="" />
  }
  return <Cross className={className} />
}

function Brand({ portal }) {
  return (
    <Link to="/" className="brand">
      <Mark portal={portal} className="brand-mark" />
      <span className="brand-lockup">
        <span className="brand-vasco">Vasco</span>
        <span className="brand-news">News</span>
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
      <header className="masthead">
        <div className="masthead-stripe" />
        <div className="edition-bar">
          <time dateTime={new Date().toISOString().slice(0, 10)}>{formatEdition()}</time>
          <span className="edition-club">Club de Regatas Vasco da Gama</span>
          <span className="edition-place">São Januário</span>
        </div>
        <div className="topbar">
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
            <Mark portal={portal} className="footer-mark" />
            <div>
              <strong>Vasco News</strong>
              <p>{portal?.description || 'A redação do Gigante da Colina.'}</p>
            </div>
          </div>
          <nav className="footer-nav" aria-label="Rodapé">
            <Link to="/">Capa</Link>
            <Link to="/ultimas">Últimas</Link>
            {categories?.map((category) => (
              <Link key={category.categoryId} to={`/categoria/${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </nav>
          <p className="copyright">© {new Date().getFullYear()} Vasco News</p>
        </div>
      </footer>
    </div>
  )
}
