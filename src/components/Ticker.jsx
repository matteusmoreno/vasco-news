import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { getArticles } from '../api'

export function Ticker({ portalId }) {
  const reduce = useReducedMotion()
  const [articles, setArticles] = useState([])

  useEffect(() => {
    let cancelled = false
    getArticles(portalId, { size: 8 })
      .then((page) => {
        if (!cancelled) setArticles(page.items ?? [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [portalId])

  if (!articles.length) return null
  const loop = reduce ? articles.slice(0, 1) : [...articles, ...articles]

  return (
    <div className="ticker">
      <span className="ticker-live">
        <span className="live-dot" />
        Ao vivo
      </span>
      <div className="ticker-window">
        <motion.div
          className="ticker-track"
          animate={reduce ? undefined : { x: ['0%', '-50%'] }}
          transition={reduce ? undefined : { duration: 36, repeat: Infinity, ease: 'linear' }}
        >
          {loop.map((article, index) => (
            <Link key={`${article.articleId}-${index}`} to={`/noticia/${article.slug}`}>
              {article.title}
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
