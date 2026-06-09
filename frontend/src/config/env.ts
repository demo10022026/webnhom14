export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const WS_BASE_URL =
  import.meta.env.VITE_WS_URL ||
  (API_BASE_URL.endsWith('/api')
    ? `${API_BASE_URL.slice(0, -4)}/api/ws`
    : `${API_BASE_URL}/ws`)
