import { getCsrfToken } from './csrf'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE'])

export function apiFetch(url, options = {}) {
  const method = (options.method ?? 'GET').toUpperCase()
  const headers = { ...options.headers }
  if (!SAFE_METHODS.has(method)) {
    headers['X-CSRFToken'] = getCsrfToken()
  }
  return fetch(url, { ...options, headers })
}
