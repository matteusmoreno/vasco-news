import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { getArticles } from '../api'
import { formatRelative, kickerFor, sourceLabel, titleKey, topKeywords } from '../format'
import { usePageMeta } from '../usePageMeta'
import { usePortal } from '../portal'
import { PageSkeleton, StateMessage, StoryCard, StoryGrid, StoryPlate } from '../components/Story'

function Spotlight({ articles }) {
  const reduce = useReducedMotion()
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'start', loop: articles.length > 2, dragFree: false },
    reduce ? [] : [Autoplay({ delay: 4800, stopOnInteraction: true, stopOnMouseEnter: true })],
  )
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    if (!emblaApi) return undefined
    const sync = () => {
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
    }
    const frame = requestAnimationFrame(sync)
    emblaApi.on('select', sync)
    emblaApi.on('reInit', sync)
    return () => {
      cancelAnimationFrame(frame)
      emblaApi.off('select', sync)
      emblaApi.off('reInit', sync)
    }
  }, [emblaApi])

  if (!articles.length) return null

  return (
    <section className="spotlight" aria-label="Mais manchetes">
      <div className="section-row">
        <h2>Na rodada</h2>
        <div className="carousel-nav">
          <button type="button" aria-label="Anterior" onClick={() => emblaApi?.scrollPrev()} disabled={!canPrev}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" aria-label="Próxima" onClick={() => emblaApi?.scrollNext()} disabled={!canNext}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="embla" ref={emblaRef}>
        <div className="embla-track">
          {articles.map((article) => (
            <div className="embla-slide" key={article.articleId}>
              <StoryCard article={article} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  const reduce = useReducedMotion()
  const { portal, categories } = usePortal()
  const [state, setState] = useState({
    portalId: portal.portalId,
    status: 'loading',
    lead: null,
    rail: [],
    rest: [],
    error: null,
  })

  if (state.portalId !== portal.portalId) {
    setState({
      portalId: portal.portalId,
      status: 'loading',
      lead: null,
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
      getArticles(portalId, { highlighted: true, size: 6 }),
      getArticles(portalId, { size: 15 }),
    ])
      .then(([highlights, latest]) => {
        if (cancelled) return
        const highlightItems = highlights.items ?? []
        const latestItems = latest.items ?? []
        const seenIds = new Set()
        const seenTitles = new Set()
        const fresh = (article) => {
          if (!article || seenIds.has(article.articleId)) return false
          const key = titleKey(article.title)
          if (key && seenTitles.has(key)) return false
          seenIds.add(article.articleId)
          if (key) seenTitles.add(key)
          return true
        }
        const lead = highlightItems.find(fresh) ?? latestItems.find(fresh) ?? null
        const rail = []
        for (const article of [...highlightItems, ...latestItems]) {
          if (!fresh(article)) continue
          rail.push(article)
          if (rail.length === 6) break
        }
        setState({
          portalId,
          status: 'ready',
          lead,
          rail,
          rest: latestItems.filter(fresh),
          error: null,
        })
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ portalId, status: 'error', lead: null, rail: [], rest: [], error })
        }
      })

    return () => {
      cancelled = true
    }
  }, [portal.portalId])

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
  if (!state.lead) {
    return (
      <StateMessage
        title="A redação ainda não publicou"
        text="Quando a primeira matéria entrar no ar, ela aparece aqui."
      />
    )
  }

  const keywords = topKeywords([state.lead, ...state.rail, ...state.rest], 6)
  const source = sourceLabel(state.lead)

  return (
    <div className="page home">
      <motion.section
        className="hero"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link className="hero-card" to={`/noticia/${state.lead.slug}`}>
          <div className="hero-copy">
            <p className="pill">
              <span className="live-dot" />
              {kickerFor(state.lead, categories)}
            </p>
            <h1>{state.lead.title}</h1>
            {state.lead.summary ? <p className="dek">{state.lead.summary}</p> : null}
            <div className="hero-meta">
              <time dateTime={state.lead.publishedAt}>{formatRelative(state.lead.publishedAt)}</time>
              {source ? <span>{source}</span> : null}
              <span className="hero-cta">
                Ler matéria
                <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </div>
          </div>
          <StoryPlate article={state.lead} className="hero-plate" />
        </Link>
      </motion.section>

      {keywords.length ? (
        <div className="topic-row" aria-label="Assuntos">
          {keywords.map((keyword) => (
            <Link key={keyword} to={`/busca?q=${encodeURIComponent(keyword)}`}>
              {keyword}
            </Link>
          ))}
        </div>
      ) : null}

      <Spotlight articles={state.rail} />

      {state.rest.length ? (
        <section className="latest">
          <div className="section-row">
            <h2>Últimas</h2>
            <Link to="/ultimas">Ver arquivo</Link>
          </div>
          <StoryGrid articles={state.rest} />
        </section>
      ) : null}
    </div>
  )
}
