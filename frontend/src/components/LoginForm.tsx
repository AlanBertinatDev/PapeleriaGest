import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'
import { authApi } from '../api/auth'
import { IconEye } from './IconEye'
import styles from './AuthModal.module.css'

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [modoOlvide, setModoOlvide] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      onSuccess()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  if (modoOlvide) {
    return <ForgotPasswordForm onVolver={() => setModoOlvide(false)} />
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        <div className={styles.passwordLabelRow}>
          Contraseña
          <button type="button" className={styles.forgotLink} onClick={() => setModoOlvide(true)}>
            ¿La olvidaste?
          </button>
        </div>
        <div className={styles.passwordField}>
          <input
            type={mostrarPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className={styles.eyeToggle}
            aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setMostrarPassword((v) => !v)}
          >
            <IconEye open={mostrarPassword} />
          </button>
        </div>
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}

function ForgotPasswordForm({ onVolver }: { onVolver: () => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setEnviado(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div>
        <p>Si el email está registrado, te vamos a mandar un link para restablecer tu contraseña.</p>
        <button type="button" className="link-button" onClick={onVolver}>
          Volver a ingresar
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Mandar link de restablecimiento'}
      </button>
      <p className="switch-hint">
        <button type="button" className="link-button" onClick={onVolver}>
          Volver a ingresar
        </button>
      </p>
    </form>
  )
}
