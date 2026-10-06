import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchArticles } from '../api'
import { materiaLabel } from '../format'
import { usePageMeta } from '../usePageMeta'
import { usePortal } from '../portal'
import { Feed, PageSkeleton, Pager, StateMessage } from '../components/Story'

const PAGE_SIZE = 8

export function SearchPage() {
  const { portal } = usePortal()
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const page = Math.max(0, Number(params.get('page') ?? '0') || 0)
  const requestKey = query ? `${portal.portalId}:${query}:${page}` : ''
  const [state, setState] = useState({
    key: requestKey,
    status: query ? 'loading' : 'idle',
    items: [],
    total: 0,
    error: null,
  })

  if (state.key !== requestKey) {
    setState({
      key: requestKey,
      status: query ? 'loading' : 'idle',
      items: [],
      total: 0,
      error: null,
    })
  }

  usePageMeta(query ? `Busca: ${query}` : 'Busca', 'Pesquise nas matérias do Vasco News.')

  useEffect(() => {
    if (!query) return undefined
    let cancelled = false
    searchArticles(portal.portalId, query, { page, size: PAGE_SIZE })
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
  }, [portal.portalId, query, page, requestKey])

  function onPage(next) {
    const copy = new URLSearchParams(params)
    copy.set('page', String(next))
    setParams(copy)
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">Busca</p>
        <h1>{query ? `“${query}”` : 'O que você procura?'}</h1>
        {!query ? <p>Procure por jogo, jogador ou assunto no campo acima.</p> : null}
        {query && state.status === 'ready' ? (
          <p>{state.total === 0 ? 'Nenhuma matéria encontrada.' : materiaLabel(state.total)}</p>
        ) : null}
      </header>
      {!query ? null : state.status === 'loading' ? <PageSkeleton /> : null}
      {state.status === 'error' ? (
        <StateMessage title="A busca não respondeu" text={state.error?.message} />
      ) : null}
      {query && state.status === 'ready' && state.items.length > 0 ? (
        <>
          <Feed articles={state.items} />
          <Pager page={page} size={PAGE_SIZE} total={state.total} onPage={onPage} />
        </>
      ) : null}
    </div>
  )
}
