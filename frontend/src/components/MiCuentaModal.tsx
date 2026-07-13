import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { authApi } from '../api/auth'
import { ApiError } from '../api/client'
import { Modal } from './Modal'

function DatosForm() {
  const { usuario, actualizarUsuario } = useAuth()
  const [nombre, setNombre] = useState(usuario?.nombre ?? '')
  const [email, setEmail] = useState(usuario?.email ?? '')
  const [telefono, setTelefono] = useState(usuario?.telefono ?? '')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(false)
    setLoading(true)
    try {
      const actualizado = await authApi.actualizarPerfil({ nombre, email, telefono: telefono || null })
      actualizarUsuario(actualizado)
      setOk(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron guardar los cambios')
    } finally {
      setLoading(false)
    }
  }

  return (
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
        Teléfono (opcional)
        <input value={telefono ?? ''} onChange={(e) => setTelefono(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      {ok && <p className="success">Datos actualizados.</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(false)
    setLoading(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setOk(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Contraseña actual
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </label>
      <label>
        Contraseña nueva
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
      </label>
      {error && <p className="error">{error}</p>}
      {ok && <p className="success">Contraseña actualizada.</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}

export function MiCuentaModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Mi cuenta" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h4 style={{ margin: '0 0 8px' }}>Mis datos</h4>
          <DatosForm />
        </div>
        <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
          <h4 style={{ margin: '0 0 8px' }}>Cambiar contraseña</h4>
          <PasswordForm />
        </div>
      </div>
    </Modal>
  )
}
