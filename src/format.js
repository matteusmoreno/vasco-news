import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const zone = 'America/Sao_Paulo'

export function formatEdition(date = new Date()) {
  const text = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: zone,
  }).format(date)
  return text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1)
}

export function formatDateTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: zone,
  }).format(date)
}

export function formatRelative(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  if (diff < 0 || diff > 6 * 24 * 60 * 60 * 1000) return formatDateTime(iso)

  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
}

export function readingTime(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 220))
  return `${minutes} min de leitura`
}

export function articleParagraphs(article) {
  const parts = String(article?.body || '')
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
  const summary = String(article?.summary || '').trim()
  if (parts.length > 1 && summary && parts[0] === summary) return parts.slice(1)
  if (parts.length === 0 && summary) return [summary]
  return parts
}

export function titleKey(title) {
  return String(title || '').trim().toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ')
}

export function sourceLabel(article) {
  const names = [...new Set((article?.sources ?? []).map((source) => source.sourceName).filter(Boolean))]
  return names.join(' · ')
}

export function kickerFor(article, categories = []) {
  const category = categories.find((item) => item.categoryId === article?.categoryId)
  if (category?.name) return category.name
  if (article?.highlighted) return 'Destaque'
  return 'Vasco'
}

function keywordLabel(value) {
  const lower = value.toLocaleLowerCase('pt-BR')
  if (value !== lower) return value
  return lower.replace(/\p{L}+/gu, (word) => word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1))
}

export function topKeywords(articles, limit = 8) {
  const counts = new Map()
  for (const article of articles) {
    for (const keyword of article.keywords ?? []) {
      const clean = keyword.trim()
      if (!clean || /^vasco$/i.test(clean)) continue
      const key = clean.toLocaleLowerCase('pt-BR')
      const current = counts.get(key)
      counts.set(key, {
        label: current?.label ?? keywordLabel(clean),
        count: (current?.count ?? 0) + 1,
      })
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'))
    .slice(0, limit)
    .map((item) => item.label)
}

export function materiaLabel(total) {
  return total === 1 ? '1 matéria' : `${total} matérias`
}
