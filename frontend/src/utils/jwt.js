import { TOKEN_KEY } from '../api/http'

// Extrae el campo "sub" (username) del token JWT guardado en localStorage.
// Si el token expiró, lo elimina y devuelve null.
export function obtenerUsuarioDelToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(TOKEN_KEY)
      return null
    }
    return payload.sub || null
  } catch {
    return null
  }
}