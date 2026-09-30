import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/auth'
import { ApiError } from '../api/client'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [listo, setListo] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setListo(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: '60px auto', padding: '0 16px' }}>
      <h2>Restablecer contraseña</h2>

      {!token && <p className="error">El link no es válido. Pedí uno nuevo desde la pantalla de ingreso.</p>}

      {token && listo && (
        <>
          <p>Tu contraseña se actualizó correctamente.</p>
          <Link to="/login">Ir a ingresar</Link>
        </>
      )}

      {token && !listo && (
        <form onSubmit={handleSubmit}>
          <label>
            Nueva contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <label>
            Confirmar contraseña
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              minLength={8}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Restablecer contraseña'}
          </button>
        </form>
      )}
    </div>
  )
}
