import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getArticles } from '../api'
import { materiaLabel } from '../format'
import { usePageMeta } from '../usePageMeta'
import { usePortal } from '../portal'
import { Feed, PageSkeleton, Pager, StateMessage } from '../components/Story'

const PAGE_SIZE = 8

export function CategoryPage() {
  const { slug } = useParams()
  const { portal, categories } = usePortal()
  const category = categories.find((item) => item.slug === slug)
  const [page, setPage] = useState(0)
  const [pageSlug, setPageSlug] = useState(slug)
  if (slug !== pageSlug) {
    setPageSlug(slug)
    setPage(0)
  }

  const activePage = slug === pageSlug ? page : 0
  const requestKey = category ? `${portal.portalId}:${category.categoryId}:${activePage}` : ''
  const [state, setState] = useState({
    key: requestKey,
    status: category ? 'loading' : 'idle',
    items: [],
    total: 0,
    error: null,
  })

  if (state.key !== requestKey) {
    setState({
      key: requestKey,
      status: category ? 'loading' : 'idle',
      items: [],
      total: 0,
      error: null,
    })
  }

  usePageMeta(category?.name || 'Seção', category?.description)

  useEffect(() => {
    if (!category) return undefined
    let cancelled = false
    getArticles(portal.portalId, { categoryId: category.categoryId, page: activePage, size: PAGE_SIZE })
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
  }, [portal.portalId, category, activePage, requestKey])

  if (!category) {
    return (
      <StateMessage title="Seção não encontrada" text="Essa editoria não existe neste portal.">
        <Link className="button" to="/">
          Voltar à capa
        </Link>
      </StateMessage>
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">Editoria</p>
        <h1>{category.name}</h1>
        {category.description ? <p>{category.description}</p> : null}
        {state.status === 'ready' ? <p className="meta">{materiaLabel(state.total)}</p> : null}
      </header>
      {state.status === 'loading' ? <PageSkeleton /> : null}
      {state.status === 'error' ? (
        <StateMessage title="Não foi possível abrir a editoria" text={state.error?.message} />
      ) : null}
      {state.status === 'ready' ? (
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
