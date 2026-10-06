import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../api'
import { materiaLabel } from '../format'
import { usePageMeta } from '../usePageMeta'
import { usePortal } from '../portal'
import { Feed, PageSkeleton, Pager, StateMessage } from '../components/Story'

const PAGE_SIZE = 8

export function ArchivePage() {
  const { portal } = usePortal()
  const [page, setPage] = useState(0)
  const requestKey = `${portal.portalId}:${page}`
  const [state, setState] = useState({
    key: requestKey,
    status: 'loading',
    items: [],
    total: 0,
    error: null,
  })

  if (state.key !== requestKey) {
    setState({ key: requestKey, status: 'loading', items: [], total: 0, error: null })
  }

  usePageMeta('Últimas', 'Todas as matérias publicadas no Vasco News.')

  useEffect(() => {
    let cancelled = false
    getArticles(portal.portalId, { page, size: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return
        setState({
          key: requestKey,
          status: 'ready',
          items: result.items ?? [],
          total: result.total ?? 0,
          error: null,
        })
      })
      .catch((error) => {
        if (!cancelled) setState({ key: requestKey, status: 'error', items: [], total: 0, error })
      })
    return () => {
      cancelled = true
    }
  }, [portal.portalId, page, requestKey])

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">Arquivo</p>
        <h1>Últimas</h1>
        {state.status === 'ready' ? <p>{materiaLabel(state.total)}</p> : null}
      </header>
      {state.status === 'loading' ? <PageSkeleton /> : null}
      {state.status === 'error' ? (
        <StateMessage title="Não foi possível listar as matérias" text={state.error?.message} />
      ) : null}
      {state.status === 'ready' && state.items.length === 0 ? (
        <p className="empty">
          Nenhuma matéria publicada. <Link to="/">Voltar à capa</Link>
        </p>
      ) : null}
      {state.status === 'ready' && state.items.length > 0 ? (
        <>
          <Feed articles={state.items} />
          <Pager
            page={page}
            size={PAGE_SIZE}
            total={state.total}
            onPage={(next) => {
              setPage(next)
              window.scrollTo(0, 0)
            }}
          />
        </>
      ) : null}
    </div>
  )
}
