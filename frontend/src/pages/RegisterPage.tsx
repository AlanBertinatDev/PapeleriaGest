import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'
import logo from '../assets/logo.jpeg'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [cedula, setCedula] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register({ nombre, email, cedula, telefono: telefono || null, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo completar el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card-logo">
        <img src={logo} alt="Bertinat Papelería" />
      </div>
      <h2>Creá tu cuenta</h2>
      <p className="subtitle">Pedí productos y materiales de imprenta online</p>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Cédula
          <input value={cedula} onChange={(e) => setCedula(e.target.value)} required />
        </label>
        <label>
          Teléfono (opcional)
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      <p>
        ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
      </p>
    </div>
  )
}
