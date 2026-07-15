import { useEffect, useState } from 'react'
import type { UsuarioResponse } from '../../api/auth'
import { usuariosApi, type NivelResponse } from '../../api/usuarios'
import { ApiError } from '../../api/client'
import { EstadoBadge } from '../../components/EstadoBadge'
import { Modal } from '../../components/Modal'
import { useAuth } from '../../auth/AuthContext'
import { PageHeader } from '../../components/PageHeader'
import { iniciales } from '../../lib/iniciales'
import { categoryStyle } from '../../lib/categoryColor'
import styles from './AdminUsuariosPage.module.css'

export function AdminUsuariosPage() {
  const { usuario: usuarioActual } = useAuth()
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([])
  const [niveles, setNiveles] = useState<NivelResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [usuarioReset, setUsuarioReset] = useState<UsuarioResponse | null>(null)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [errorReset, setErrorReset] = useState<string | null>(null)
  const [enviandoReset, setEnviandoReset] = useState(false)

  function cargar() {
    usuariosApi
      .listar()
      .then(setUsuarios)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los usuarios'))
    usuariosApi.listarNiveles().then(setNiveles).catch(() => {})
  }

  useEffect(cargar, [])

  async function handleCambiarNivel(id: number, nivelId: number) {
    setError(null)
    try {
      await usuariosApi.cambiarNivel(id, nivelId)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar el rol')
    }
  }

  async function handleToggleActivo(usuario: UsuarioResponse) {
    setError(null)
    try {
      if (usuario.activo) {
        await usuariosApi.desactivar(usuario.id)
      } else {
        await usuariosApi.activar(usuario.id)
      }
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el usuario')
    }
  }

  function abrirModalReset(usuario: UsuarioResponse) {
    setUsuarioReset(usuario)
    setNuevaPassword('')
    setErrorReset(null)
    setMensaje(null)
  }

  function cerrarModalReset() {
    setUsuarioReset(null)
  }

  async function handleResetearPassword() {
    if (!usuarioReset) return
    if (nuevaPassword.length < 8) {
      setErrorReset('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setErrorReset(null)
    setEnviandoReset(true)
    try {
      await usuariosApi.resetearPassword(usuarioReset.id, nuevaPassword)
      setMensaje(`Contraseña de ${usuarioReset.nombre} actualizada`)
      setUsuarioReset(null)
    } catch (err) {
      setErrorReset(err instanceof ApiError ? err.message : 'No se pudo resetear la contraseña')
    } finally {
      setEnviandoReset(false)
    }
  }

  return (
    <div>
      <PageHeader title="Usuarios" subtitle="Gestioná roles y acceso de clientes, docentes y administradores" />
      {error && <p className="error">{error}</p>}
      {mensaje && <p className="success">{mensaje}</p>}
      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const esUsuarioActual = u.id === usuarioActual?.id
              return (
                <tr key={u.id}>
                  <td>
                    <div className={styles.avatar}>{iniciales(u.nombre)}</div>
                  </td>
                  <td>
                    {u.nombre}
                    {esUsuarioActual && (
                      <span className="badge" style={{ marginLeft: 6 }}>
                        Vos
                      </span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className={styles.roleSelect}
                      style={categoryStyle(u.nivel)}
                      value={niveles.find((n) => n.nombre === u.nivel)?.id ?? ''}
                      onChange={(e) => handleCambiarNivel(u.id, Number(e.target.value))}
                      disabled={esUsuarioActual}
                      title={esUsuarioActual ? 'No podés cambiar tu propio rol' : undefined}
                    >
                      {niveles.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <EstadoBadge estado={u.activo ? 'Activa' : 'Inactiva'} />
                  </td>
                  <td>
                    <button
                      className="secondary"
                      onClick={() => handleToggleActivo(u)}
                      disabled={esUsuarioActual}
                      title={esUsuarioActual ? 'No podés activar o desactivar tu propia cuenta' : undefined}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button className="secondary" style={{ marginLeft: 6 }} onClick={() => abrirModalReset(u)}>
                      Resetear contraseña
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {usuarioReset && (
        <Modal title={`Resetear contraseña de ${usuarioReset.nombre}`} onClose={cerrarModalReset}>
          <label>
            Contraseña nueva
            <input
              type="text"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoFocus
            />
          </label>
          {errorReset && <p className="error">{errorReset}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button type="button" className="secondary" onClick={cerrarModalReset}>
              Cancelar
            </button>
            <button type="button" onClick={handleResetearPassword} disabled={enviandoReset}>
              {enviandoReset ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
