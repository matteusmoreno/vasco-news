import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatRelative, kickerFor, sourceLabel } from '../format'
import { usePortal } from '../portal'
import { Cross } from './Cross'

function tiltOf(id) {
  let n = 0
  for (const char of String(id || '')) n = (n * 33 + char.charCodeAt(0)) % 997
  return (n % 15) - 7
}

export function StoryPlate({ article, className = '' }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(article?.imageUrl) && !failed
  const tilt = tiltOf(article?.articleId)

  return (
    <div className={`plate ${className}`.trim()}>
      {showImage ? (
        <img src={article.imageUrl} alt="" onError={() => setFailed(true)} />
      ) : (
        <div className={`plate-art ${tilt > 0 ? 'flip' : ''}`}>
          <span className="plate-sash" style={{ '--tilt': `${tilt}deg` }} />
          <Cross />
        </div>
      )}
    </div>
  )
}

export function StoryCard({ article }) {
  const { categories } = usePortal()
  const source = sourceLabel(article)

  return (
    <article className="card">
      <Link to={`/noticia/${article.slug}`}>
        <StoryPlate article={article} className="card-plate" />
        <div className="card-body">
          <p className="kicker">{kickerFor(article, categories)}</p>
          <h3>{article.title}</h3>
          {article.summary ? <p>{article.summary}</p> : null}
          <p className="card-meta">
            <time dateTime={article.publishedAt}>{formatRelative(article.publishedAt)}</time>
            {source ? <span>{source}</span> : null}
          </p>
        </div>
      </Link>
    </article>
  )
}

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export function StoryGrid({ articles }) {
  const reduce = useReducedMotion()
  if (!articles?.length) return <p className="empty">Nenhuma matéria nesta lista.</p>

  return (
    <motion.div
      className="card-grid"
      initial={reduce ? false : 'hidden'}
      animate="show"
      variants={reduce ? undefined : gridVariants}
    >
      {articles.map((article) => (
        <motion.div key={article.articleId} variants={reduce ? undefined : cardVariants}>
          <StoryCard article={article} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export function Feed(props) {
  return <StoryGrid {...props} />
}

export function Pager({ page, size, total, onPage }) {
  const pages = Math.ceil(total / size)
  if (pages <= 1) return null
  return (
    <nav className="pager" aria-label="Paginação">
      <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 0}>
        <ChevronLeft size={18} aria-hidden="true" />
        Anterior
      </button>
      <span>
        Página {page + 1} de {pages}
      </span>
      <button type="button" onClick={() => onPage(page + 1)} disabled={page + 1 >= pages}>
        Próxima
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  )
}

export function StateMessage({ title, text, children }) {
  return (
    <div className="state">
      <Cross />
      <h1>{title}</h1>
      {text ? <p>{text}</p> : null}
      {children}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Carregando">
      <div className="skeleton hero-skel" />
      <div className="skel-grid">
        <div className="skeleton card-skel" />
        <div className="skeleton card-skel" />
        <div className="skeleton card-skel" />
      </div>
    </div>
  )
}
