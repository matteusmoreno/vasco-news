import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCategories, getPortal } from './api'

const PortalContext = createContext(null)

function applyTheme(theme) {
  if (!theme) return
  const color = theme.primaryColor?.trim()
  if (color && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) {
    document.documentElement.style.setProperty('--red', color)
  }
  if (theme.faviconUrl) {
    const icon = document.querySelector('link[rel="icon"]')
    if (icon) icon.href = theme.faviconUrl
  }
}

export function PortalProvider({ children }) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({
    attempt: 0,
    status: 'loading',
    portal: null,
    categories: [],
    error: null,
  })

  if (state.attempt !== attempt) {
    setState({
      attempt,
      status: 'loading',
      portal: null,
      categories: [],
      error: null,
    })
  }

  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const portal = await getPortal()
        const payload = await getCategories(portal.portalId)
        if (cancelled) return
        const categories = (Array.isArray(payload) ? payload : [])
          .filter((category) => category.status !== 'INACTIVE')
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        applyTheme(portal.theme)
        setState({ attempt, status: 'ready', portal, categories, error: null })
      } catch (error) {
        if (!cancelled) {
          setState({ attempt, status: 'error', portal: null, categories: [], error })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [attempt])

  const value = useMemo(() => ({ ...state, retry }), [state, retry])
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
}

// O hook divide o arquivo com o provider de propósito: os dois leem o mesmo contexto.
// eslint-disable-next-line react-refresh/only-export-components
export function usePortal() {
  const context = useContext(PortalContext)
  if (!context) throw new Error('usePortal precisa estar dentro de PortalProvider')
  return context
}
