import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { getArticles } from '../api'
import { formatRelative, kickerFor, sourceLabel, titleKey } from '../format'
import { usePageMeta } from '../usePageMeta'
import { usePortal } from '../portal'
import { Cross } from '../components/Cross'
import { PageSkeleton, StateMessage, StoryGrid, StoryPlate } from '../components/Story'

const SLIDE_MS = 6000
const GRID_COUNT = 18
const HIGHLIGHT_COUNT = 50

function filledGrid(items) {
  if (items.length < 6) return items
  const remainder = items.length % 6
  return remainder === 0 ? items : items.slice(0, items.length - remainder)
}

function uniqueArticles(list) {
  const seenIds = new Set()
  const seenTitles = new Set()
  const items = []
  for (const article of list) {
    if (!article || seenIds.has(article.articleId)) continue
    const key = titleKey(article.title)
    if (key && seenTitles.has(key)) continue
    seenIds.add(article.articleId)
    if (key) seenTitles.add(key)
    items.push(article)
  }
  return items
}

function newestFirst(articles) {
  return [...articles].sort((left, right) => {
    const leftTime = new Date(left.publishedAt).getTime()
    const rightTime = new Date(right.publishedAt).getTime()
    return (Number.isNaN(rightTime) ? 0 : rightTime) - (Number.isNaN(leftTime) ? 0 : leftTime)
  })
}

export function HomePage() {
  const reduce = useReducedMotion()
  const { portal, categories } = usePortal()
  const [state, setState] = useState({
    portalId: portal.portalId,
    status: 'loading',
    slides: [],
    rail: [],
    rest: [],
    error: null,
  })
  const [cursor, setCursor] = useState({ key: '', index: 0 })
  const [hovering, setHovering] = useState(false)
  const [hidden, setHidden] = useState(false)

  if (state.portalId !== portal.portalId) {
    setState({
      portalId: portal.portalId,
      status: 'loading',
      slides: [],
      rail: [],
      rest: [],
      error: null,
    })
  }

  usePageMeta('Vasco News', portal?.description || 'Notícias do Club de Regatas Vasco da Gama.')

  useEffect(() => {
    let cancelled = false
    const portalId = portal.portalId

    Promise.all([
      getArticles(portalId, { highlighted: true, size: HIGHLIGHT_COUNT }),
      getArticles(portalId, { size: GRID_COUNT + HIGHLIGHT_COUNT }),
    ])
      .then(([highlights, latest]) => {
        if (cancelled) return
        const highlightItems = newestFirst(uniqueArticles(highlights.items ?? [])).slice(0, 4)
        const latestItems = uniqueArticles(latest.items ?? [])
        const slides = highlightItems.length ? highlightItems : latestItems.slice(0, 1)
        const slideIds = new Set(slides.map((article) => article.articleId))
        const slideTitles = new Set(slides.map((article) => titleKey(article.title)).filter(Boolean))
        const pool = latestItems.filter((article) => {
          if (slideIds.has(article.articleId)) return false
          const key = titleKey(article.title)
          return !key || !slideTitles.has(key)
        })
        setState({
          portalId,
          status: 'ready',
          slides,
          rail: highlightItems,
          rest: filledGrid(pool.slice(0, GRID_COUNT)),
          error: null,
        })
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ portalId, status: 'error', slides: [], rail: [], rest: [], error })
        }
      })

    return () => {
      cancelled = true
    }
  }, [portal.portalId])

  const slideKey = state.slides.map((article) => article.articleId).join('|')
  if (cursor.key !== slideKey) {
    setCursor({ key: slideKey, index: 0 })
  }
  const slideCount = state.slides.length
  const index = cursor.key === slideKey ? cursor.index : 0
  const activeIndex = slideCount ? index % slideCount : 0
  const active = state.slides[activeIndex] ?? null

  useEffect(() => {
    function onVisibility() {
      setHidden(document.hidden)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (reduce || hovering || hidden || slideCount < 2) return undefined
    const timer = window.setInterval(() => {
      setCursor((current) => ({
        key: slideKey,
        index: ((current.key === slideKey ? current.index : 0) + 1) % slideCount,
      }))
    }, SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [reduce, hovering, hidden, slideCount, slideKey, activeIndex])

  if (state.status === 'loading') {
    return (
      <div className="page">
        <PageSkeleton />
      </div>
    )
  }
  if (state.status === 'error') {
    return <StateMessage title="Não foi possível abrir a capa" text={state.error?.message} />
  }
  if (!active) {
    return (
      <StateMessage
        title="A redação ainda não publicou"
        text="Quando a primeira matéria entrar no ar, ela aparece aqui."
      />
    )
  }

  const source = sourceLabel(active)
  const desk = state.rail
  const latest = state.rest

  return (
    <div className="home">
      <motion.section
        className="shell lead"
        aria-label="Manchete"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="lead-stage"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onFocus={() => setHovering(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setHovering(false)
          }}
        >
          <Link className="lead-main" to={`/noticia/${active.slug}`}>
            <div className="lead-slides">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active.articleId}
                  className="lead-slide"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <StoryPlate article={active} className="lead-plate" />
                  <div className="lead-shade" />
                  <div className="lead-copy">
                    <p className="pill">
                      <span className="live-dot" />
                      {kickerFor(active, categories)}
                    </p>
                    <h1>{active.title}</h1>
                    {active.summary ? <p className="dek">{active.summary}</p> : null}
                    <div className="hero-meta">
                      <time dateTime={active.publishedAt}>{formatRelative(active.publishedAt)}</time>
                      {source ? <span>{source}</span> : null}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <Cross className="lead-mark" />
          </Link>
          {slideCount > 1 && slideCount <= 6 ? (
            <div className="lead-dots" role="tablist" aria-label="Manchetes em destaque">
              {state.slides.map((article, slideIndex) => (
                <button
                  key={article.articleId}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === activeIndex}
                  aria-label={article.title}
                  className={slideIndex === activeIndex ? 'is-on' : undefined}
                  onClick={() => setCursor({ key: slideKey, index: slideIndex })}
                />
              ))}
            </div>
          ) : null}
        </div>

        {desk.length ? (
          <aside className="lead-rail" aria-label="Mais manchetes">
            <p className="rail-label">Nesta edição</p>
            <div className="rail-list">
            {desk.map((article, itemIndex) => (
              <Link
                key={article.articleId}
                className={article.articleId === active?.articleId ? 'rail-item is-on' : 'rail-item'}
                to={`/noticia/${article.slug}`}
              >
                <StoryPlate article={article} className="rail-plate" />
                <div className="rail-copy">
                  <p className="kicker">
                    <span>{String(itemIndex + 1).padStart(2, '0')}</span>
                    {kickerFor(article, categories)}
                  </p>
                  <h2>{article.title}</h2>
                  <time dateTime={article.publishedAt}>{formatRelative(article.publishedAt)}</time>
                </div>
              </Link>
            ))}
            </div>
          </aside>
        ) : null}
      </motion.section>

      <div className="shell home-body">
        {latest.length ? (
          <section className="latest">
            <div className="section-row">
              <h2>Últimas</h2>
              <Link to="/ultimas">
                Ver arquivo
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <StoryGrid articles={latest} />
          </section>
        ) : null}
      </div>
    </div>
  )
}
