import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { getArticle, getArticles } from '../api'
import { articleParagraphs, formatDateTime, kickerFor, readingTime, sourceLabel } from '../format'
import { usePageMeta } from '../usePageMeta'
import { usePortal } from '../portal'
import { PageSkeleton, StateMessage, StoryGrid, StoryPlate } from '../components/Story'

export function ArticlePage() {
  const { slug } = useParams()
  const { portal, categories } = usePortal()
  const requestKey = `${portal.portalId}:${slug}`
  const [state, setState] = useState({
    key: requestKey,
    status: 'loading',
    article: null,
    related: [],
    error: null,
  })
  const [notice, setNotice] = useState({ slug, text: '' })

  if (state.key !== requestKey) {
    setState({ key: requestKey, status: 'loading', article: null, related: [], error: null })
  }
  if (notice.slug !== slug) {
    setNotice({ slug, text: '' })
  }

  usePageMeta(state.article?.title || 'Matéria', state.article?.summary)

  useEffect(() => {
    let cancelled = false
    const articlePromise = getArticle(portal.portalId, slug)
    const relatedPromise = getArticles(portal.portalId, { size: 6 }).catch(() => ({ items: [] }))

    articlePromise
      .then(async (article) => {
        const relatedPage = await relatedPromise
        if (cancelled) return
        setState({
          key: requestKey,
          status: 'ready',
          article,
          related: (relatedPage.items ?? []).filter((item) => item.articleId !== article.articleId).slice(0, 3),
          error: null,
        })
      })
      .catch((error) => {
        if (!cancelled) setState({ key: requestKey, status: 'error', article: null, related: [], error })
      })

    return () => {
      cancelled = true
    }
  }, [portal.portalId, slug, requestKey])

  useEffect(() => {
    const article = state.article
    if (!article) return undefined
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.article = 'true'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.summary,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      image: article.imageUrl ? [article.imageUrl] : undefined,
      mainEntityOfPage: window.location.href,
      publisher: { '@type': 'Organization', name: 'Vasco News' },
    })
    document.head.appendChild(script)
    return () => script.remove()
  }, [state.article])

  useEffect(() => {
    if (!notice.text) return undefined
    const timer = setTimeout(() => setNotice({ slug, text: '' }), 2200)
    return () => clearTimeout(timer)
  }, [notice.text, slug])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setNotice({ slug, text: 'Link copiado' })
    } catch {
      setNotice({ slug, text: 'Não foi possível copiar o link' })
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="page">
        <PageSkeleton />
      </div>
    )
  }
  if (state.status === 'error') {
    const missing = state.error?.status === 404
    return (
      <StateMessage
        title={missing ? 'Matéria não encontrada' : 'Não foi possível abrir a matéria'}
        text={missing ? 'Ela pode ter saído do ar.' : state.error?.message}
      >
        <Link className="button" to="/">
          Voltar à capa
        </Link>
      </StateMessage>
    )
  }

  const article = state.article
  const paragraphs = articleParagraphs(article)
  const source = sourceLabel(article)
  const copied = notice.text === 'Link copiado'

  return (
    <article className="story">
      <header className="story-hero">
        <StoryPlate article={article} className="story-hero-plate" />
        <div className="story-hero-shade" />
        <div className="shell story-hero-copy">
          <p className="pill">{kickerFor(article, categories)}</p>
          <h1>{article.title}</h1>
          {article.summary ? <p className="dek">{article.summary}</p> : null}
          <div className="hero-meta">
            <time dateTime={article.publishedAt}>{formatDateTime(article.publishedAt)}</time>
            <span>{readingTime(`${article.summary || ''} ${article.body || ''}`)}</span>
            {source ? <span>{source}</span> : null}
            <button type="button" className="button ghost" onClick={copyLink}>
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {notice.text || 'Copiar link'}
            </button>
          </div>
        </div>
      </header>

      <div className="shell story-layout">
        <div className="story-body">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <aside className="story-side">
          {article.keywords?.length ? (
            <div>
              <h2>Assuntos</h2>
              <div className="topic-row">
                {article.keywords.map((keyword) => (
                  <Link key={keyword} to={`/busca?q=${encodeURIComponent(keyword)}`}>
                    {keyword}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {article.sources?.length ? (
            <div>
              <h2>Fontes</h2>
              <ul className="sources">
                {article.sources.map((item) => (
                  <li key={item.newsItemId || item.url}>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <span>{item.sourceName || 'Fonte'}</span>
                        <strong>{item.title || item.url}</strong>
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    ) : (
                      <p>
                        <span>{item.sourceName || 'Fonte'}</span>
                        <strong>{item.title}</strong>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {state.related.length ? (
        <section className="shell related">
          <div className="section-row">
            <h2>Continue lendo</h2>
          </div>
          <StoryGrid articles={state.related} />
        </section>
      ) : null}
    </article>
  )
}
