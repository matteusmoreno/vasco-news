const base = String(import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

export const portalSlug = import.meta.env.VITE_PORTAL_SLUG || 'vasco-news'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const messages = {
  0: 'Não foi possível falar com a redação. Verifique se a API está no ar.',
  400: 'Não foi possível concluir esta busca.',
  404: 'Não encontramos o que você procura.',
}

async function request(path) {
  let response
  try {
    response = await fetch(`${base}${path}`, {
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new ApiError(messages[0], 0)
  }

  if (!response.ok) {
    throw new ApiError(messages[response.status] || 'Não foi possível carregar esta página.', response.status)
  }

  return response.json()
}

export function getPortal() {
  return request(`/v1/portals/slug/${encodeURIComponent(portalSlug)}`)
}

export function getCategories(portalId) {
  return request(`/v1/portals/${portalId}/categories`)
}

export function getArticles(portalId, { categoryId, highlighted, page = 0, size = 20 } = {}) {
  const params = new URLSearchParams()
  if (categoryId) params.set('categoryId', categoryId)
  if (highlighted != null) params.set('highlighted', String(highlighted))
  params.set('page', String(page))
  params.set('size', String(size))
  return request(`/v1/portals/${portalId}/articles?${params}`)
}

export function getArticle(portalId, slug) {
  return request(`/v1/portals/${portalId}/articles/slug/${encodeURIComponent(slug)}`)
}

export function searchArticles(portalId, query, { page = 0, size = 10 } = {}) {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    size: String(size),
  })
  return request(`/v1/portals/${portalId}/search?${params}`)
}
